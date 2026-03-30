# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**Fatal error handling in client library:**
- Issue: `GetAccount()` function calls `os.Exit(1)` directly when encountering errors (JSON unmarshaling, API failures). This crashes the entire application instead of propagating errors gracefully.
- Files: `backend/internal/client/pylon.go` (lines 59-61, 64-67)
- Impact: Any malformed API response from Pylon terminates the service immediately, breaking graceful shutdown and health check mechanisms. Cannot be caught or recovered by callers.
- Fix approach: Return errors from `GetAccount()` and handle them in `backend/internal/service/issue.go`. Let callers decide whether to abort or continue with degraded functionality.

**Missing error response status codes:**
- Issue: `DoRequest()` returns `http.StatusInternalServerError` in error cases but doesn't propagate the actual HTTP status code from upstream API. When API returns 401, 403, or other non-200 status, the function returns 500, masking the real problem.
- Files: `backend/internal/client/pylon.go` (lines 41-42)
- Impact: Frontend cannot distinguish between authentication failures and server errors. User gets "500 Server Error" instead of "401 Unauthorized", preventing proper error handling and user feedback.
- Fix approach: Return the actual `respStatusCode` even when non-200, or modify return signature to separate HTTP status from body content.

**Unsafe map access for custom fields:**
- Issue: `GetIssuesWaitingOnUser()` accesses `issue.CustomFields["priority"].Value` without checking if "priority" key exists or if the value is empty.
- Files: `backend/internal/service/issue.go` (line 52)
- Impact: Panic if Pylon API response doesn't include "priority" in custom_fields for an issue. This crashes the entire `/api/waiting` endpoint.
- Fix approach: Check key existence before access: `if priority, ok := issue.CustomFields["priority"]; ok { ... }` or provide default value with `priority := ""`.

**HTTP client instantiation per request:**
- Issue: `DoRequest()` creates a new `http.Client{}` for every single API call instead of reusing a shared client.
- Files: `backend/internal/client/pylon.go` (line 16)
- Impact: High memory overhead and connection pool waste. Each request incurs TCP/TLS connection overhead. Connection pooling benefits are lost.
- Fix approach: Create a singleton `http.Client` at package init or pass it as dependency to `DoRequest()`.

## Known Bugs

**Status code not returned on API errors:**
- Symptom: When Pylon API returns an error response (non-200 status), callers receive `http.StatusInternalServerError` but the actual status code is discarded. Makes it impossible to handle specific errors.
- Files: `backend/internal/client/pylon.go` (line 42)
- Trigger: Any Pylon API request that returns status != 200 (e.g., 401, 403, 404)
- Workaround: Check logs to see what Pylon API actually returned, but frontend has no way to know

**Missing nil checks on required API fields:**
- Symptom: If Pylon API returns issue without expected custom fields, application panics on field access
- Files: `backend/internal/service/issue.go` (line 52: `issue.CustomFields["priority"].Value`)
- Trigger: When Pylon API response doesn't include "priority" custom field for an issue
- Workaround: None - service crashes. Must be restarted.

## Security Considerations

**Authorization header passed through request chain:**
- Risk: Authorization header is passed as plain string through `RequestConfig.Authorization` field. No validation that it's actually a valid bearer token format.
- Files: `backend/internal/client/pylon.go` (lines 23, 56), `backend/internal/api/handlers.go` (lines 44, 79, 110)
- Current mitigation: HTTPS enforced in production, frontend stores token in browser storage (vulnerable to XSS)
- Recommendations:
  1. Validate authorization header format in handlers (should start with "Bearer " or similar)
  2. Log authorization failures separately (without exposing token value)
  3. Consider storing tokens server-side with session IDs instead of passing through for each request
  4. Add rate limiting to `/api/users`, `/api/teams`, `/api/waiting` endpoints to prevent token brute-forcing

**No validation of API responses:**
- Risk: All Pylon API responses are directly unmarshaled into structs with no validation. Malicious/malformed responses could inject data or cause panics.
- Files: `backend/internal/client/pylon.go` (lines 64, 28), `backend/internal/api/handlers.go` (lines 56, 91)
- Current mitigation: Trust in Pylon API trustworthiness
- Recommendations: Add schema validation after unmarshal, check bounds on array lengths, sanitize strings before returning in JSON

**XSS vulnerability in frontend storage:**
- Risk: Pylon API token stored in browser localStorage with no protection. XSS attack can steal token.
- Files: `frontend/assets/src/js/storage.ts` (likely - file not fully examined)
- Current mitigation: None observed
- Recommendations: Use httpOnly cookies instead of localStorage, add Content Security Policy headers

## Performance Bottlenecks

**Account lookup N+1 query problem:**
- Problem: For each issue with unique account, a separate API call to `/accounts/{accountID}` is made to fetch VIP status
- Files: `backend/internal/service/issue.go` (line 41: calls `client.GetAccount()` in loop)
- Cause: No batching or caching of account data. If user has 20 issues from 10 different accounts, makes 10 separate HTTP requests to Pylon API
- Improvement path:
  1. Add in-memory cache of account VIP status (with TTL)
  2. Batch account requests if Pylon API supports bulk endpoint
  3. Consider fetching all accounts upfront if dataset is small

**Synchronous API calls block request handler:**
- Problem: Backend makes serial HTTP requests to Pylon API during request handling with no parallelization
- Files: `backend/internal/service/issue.go` (lines 14-61: `GetIssuesWaitingOnUser()` fetches issues, then fetches account data sequentially)
- Cause: Loop processes issues one by one, calling `GetAccount()` synchronously for each
- Improvement path: Use goroutines with sync.WaitGroup or errgroup to parallelize account fetches after issues are loaded

**Unbounded issue list returned to frontend:**
- Problem: No pagination limit on issues returned from `/api/waiting`. If user has thousands of issues, all are fetched and serialized to JSON
- Files: `backend/internal/service/issue.go` (line 34: pre-allocates with `len(response.Data)` - no limit)
- Cause: Pylon API response is assumed to fit in memory; no pagination handling
- Improvement path: Add `limit` query parameter, implement cursor-based pagination, add caching strategy for large datasets

## Fragile Areas

**Pylon API response structure assumptions:**
- Files: `backend/internal/models/models.go` (lines 42-72: Issue struct), `backend/internal/service/issue.go` (line 52: direct map access)
- Why fragile: Code assumes Pylon API response includes all expected fields. Missing fields cause panics. Model changes break silently if API adds required fields.
- Safe modification:
  1. Use pointer fields with nil checks: `Priority *string` instead of `string`
  2. Add validation function that checks response for required fields before processing
  3. Add integration tests that verify parsing of actual Pylon API responses
- Test coverage: No test coverage for Pylon API response parsing observed

**Graceful shutdown implementation:**
- Files: `backend/cmd/pylon-proxy/main.go` (lines 34-50), `frontend/cmd/pylon-proxy/main.go` (same pattern)
- Why fragile: 25-second sleep before shutdown is hardcoded and may not match load balancer's health check interval. If health check is every 10 seconds, instances will be marked healthy during shutdown.
- Safe modification:
  1. Make grace period configurable via environment variable
  2. Verify timing matches deployment's load balancer configuration
  3. Test that health checks return 503 before request timeout
- Test coverage: No automated tests for graceful shutdown sequence

**Echo router with catch-all proxy:**
- Files: `frontend/internal/api/routes.go` (line 15: `e.Any("/api/*", ...)`)
- Why fragile: Catch-all route with proxy middleware is registered after static assets but before SPA fallback. Order matters and is easy to break.
- Safe modification:
  1. Document route registration order requirements
  2. Add comments explaining why specific order is needed
  3. Consider extracting route registration logic to separate function with clear sequence
- Test coverage: No integration tests verifying routing behavior

## Scaling Limits

**No caching of account/user/team data:**
- Current capacity: API calls made fresh for every request, no caching. If backend has 10 concurrent users all viewing issues, makes ~100 API calls to Pylon
- Limit: Pylon API rate limiting will kick in. No visibility into Pylon rate limit headers.
- Scaling path:
  1. Add Redis cache layer with 5-minute TTL for users/teams/accounts
  2. Implement cache invalidation strategy (time-based or webhook-based from Pylon)
  3. Add monitoring for cache hit/miss rates and Pylon API response times

**Single instance deployment:**
- Current capacity: Both backend and frontend are single instances in docker-compose, no replication
- Limit: Single point of failure. If container crashes, service is down.
- Scaling path:
  1. docker-compose should be for dev only; production needs Kubernetes with 2+ replicas
  2. Backend/frontend can be load balanced independently
  3. Need shared Redis for session/cache across replicas

**No connection pooling configuration:**
- Current capacity: Each `http.Client` in DoRequest creates new TCP connections
- Limit: High latency with large request volume. TCP connection limit exhaustion under high load.
- Scaling path: Configure http.Client with transport settings for connection pooling (MaxIdleConns, MaxConnsPerHost)

## Dependencies at Risk

**Echo framework version pinned to 4.13.4:**
- Risk: No newer versions being used. Security patches in Echo ecosystem may not be applied. Dependency graph not reviewed for known vulnerabilities.
- Impact: If vulnerability found in Echo or its dependencies, requires manual go.mod update and rebuild
- Migration plan: Set up dependabot for automated security updates, establish patch policy (e.g., apply security patches within 7 days)

**Node.js LTS dependencies without lock versioning:**
- Risk: `package.json` uses exact versions for `typescript@^5.3.3` and other devDependencies. Caret allows minor/patch updates. `npm ci` in CI is correct, but local builds might differ.
- Impact: Inconsistent builds between developer machines and CI
- Migration plan: Use `npm ci` exclusively (already done in docker-compose), consider using `npm audit` in CI/CD pipeline

## Missing Critical Features

**No authentication between frontend and backend:**
- Problem: Frontend can call backend `/api/*` endpoints directly without any authentication. If backend is exposed to internet, anyone can abuse it.
- Blocks: Cannot securely deploy backend as separate service. Backend must be behind frontend proxy.
- Priority: High - if architecture changes to expose backend directly, this becomes critical

**No request logging for audit trail:**
- Problem: No structured logging of who (which user, identified by API key hash) called which endpoint when. Makes debugging user issues difficult.
- Blocks: Cannot audit which users accessed which issues, or troubleshoot specific user's API key issues
- Priority: Medium - nice to have for debugging, required for compliance if handling sensitive data

**No rate limiting or abuse prevention:**
- Problem: Any client with valid Pylon API key can hammer backend endpoints. No throttling or circuit breaker.
- Blocks: If frontend is DDoSed, backend is taken down along with it
- Priority: Medium - depends on deployment context and data sensitivity

## Test Coverage Gaps

**No unit tests for Pylon client:**
- What's not tested: `DoRequest()` error cases, status code handling, request building with query params
- Files: `backend/internal/client/pylon.go`
- Risk: Bugs in HTTP request building or error handling go undetected. Mock API changes break without warning.
- Priority: High

**No tests for service layer business logic:**
- What's not tested: Issue filtering by userID/teamID, issue sorting by VIP/priority/time, account lookup caching
- Files: `backend/internal/service/issue.go`
- Risk: Changes to filtering/sorting logic could silently break user expectations. N+1 query optimization is impossible to verify.
- Priority: High

**No integration tests:**
- What's not tested: Full request-response flow with mock Pylon API. Frontend SPA navigation and API interactions.
- Files: All
- Risk: Routing bugs, handler integration issues, API contract violations go undetected
- Priority: Medium - would catch many fragile areas mentioned above

**No tests for error cases:**
- What's not tested: Handling of malformed JSON from Pylon API, missing required fields, connection timeouts, auth failures
- Files: `backend/internal/client/pylon.go`, `backend/internal/api/handlers.go`
- Risk: Application crashes or incorrect error responses in production
- Priority: High

---

*Concerns audit: 2026-03-30*
