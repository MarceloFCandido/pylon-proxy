# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Proxy pattern with multi-tier separation into backend and frontend services. The architecture uses client-server design with a lightweight HTTP proxy layer in the frontend that forwards all API calls to a backend service.

**Key Characteristics:**
- Two separate Go applications communicating via HTTP
- Backend acts as API proxy to external Pylon service
- Frontend serves single-page application (SPA) and proxies API calls to backend
- Clear separation between serving static assets and API routing
- Graceful shutdown mechanism with health check integration
- Environment-based configuration for flexibility across deployment targets

## Layers

**Backend Service Layer:**
- Purpose: Acts as a proxy to the Pylon API, authenticating requests and transforming/simplifying responses
- Location: `backend/internal/`
- Contains: HTTP handlers, data models, API client, business logic
- Depends on: Echo web framework, Pylon API (external), HTTP client
- Used by: Frontend service (all API requests)

**Frontend Service Layer:**
- Purpose: Serves the single-page application and proxies API requests to the backend
- Location: `frontend/internal/`
- Contains: HTTP handlers, routing configuration, health checks
- Depends on: Echo web framework, backend service
- Used by: Web browsers (users)

**API Request Layer:**
- Purpose: Handles HTTP communication between clients and Pylon API
- Location: `backend/internal/client/pylon.go`
- Contains: HTTP request building, header management, response parsing
- Depends on: HTTP client library, request models
- Used by: Handler and service layers

**Service/Business Logic Layer:**
- Purpose: Processes and transforms API responses, applies business rules (filtering, sorting)
- Location: `backend/internal/service/issue.go`
- Contains: Issue filtering logic, business rules (VIP detection, state filtering)
- Depends on: Client layer, model definitions
- Used by: API handlers

**Frontend Application Layer:**
- Purpose: TypeScript/JavaScript code handling routing, API calls, state management, UI logic
- Location: `frontend/assets/src/js/`
- Contains: Router, API client, page components, local storage utilities
- Depends on: Webpack bundler, TypeScript compiler
- Used by: Browser runtime

**Data Model Layer:**
- Purpose: Defines request/response schemas and simplified data structures
- Location: `backend/internal/models/models.go`, `frontend/assets/src/types/`
- Contains: Struct definitions for Pylon API responses, simplified models for frontend
- Depends on: None (data-only)
- Used by: All layers requiring data serialization

## Data Flow

**User Authentication Flow:**
1. User enters Pylon API key in frontend (Home page)
2. Frontend stores API key in localStorage via Storage utility
3. Frontend validates key by calling `/api/users` endpoint
4. API client passes authorization header with each request

**Issue Retrieval Flow:**
1. User navigates to `/issues` page in frontend
2. Frontend router checks for stored API key (redirects to home if missing)
3. Issues page calls `ApiClient.getIssuesWaitingOnUser(userId, teamId)`
4. Frontend's proxy middleware forwards request to backend `/api/waiting`
5. Backend handler extracts query params and authorization header
6. Backend's `GetIssuesWaitingOnUser()` service method:
   - Calls `client.DoRequest()` to fetch issues from Pylon API
   - Filters issues by state (`waiting_on_you`), user ID, and team ID
   - For each issue, fetches account details via `client.GetAccount()` to detect VIP status
   - Applies sorting via `utils.SortIssues()` (VIP first, then priority, then timestamp)
   - Returns simplified issue list
7. Frontend receives JSON response and renders issues list

**State Management:**
- Backend: Stateless service (no persistent state)
- Frontend: Local storage manages API key and theme preference
- Atomic flag manages graceful shutdown state across both services

## Key Abstractions

**Request/Response Models:**
- Purpose: Type-safe serialization/deserialization of Pylon API responses
- Examples: `backend/internal/models/models.go` (Issue, Team, User, Account structs)
- Pattern: Go struct tags with JSON field mappings, pagination support

**Simplified Data Models:**
- Purpose: Reduce frontend complexity by transforming Pylon's full models to minimal required fields
- Examples: `SimplifiedIssue` (contains only id, account, last_update_time, priority, title)
- Pattern: Transformation logic in handlers (select and map fields)

**Echo HTTP Framework Abstraction:**
- Purpose: Consistent HTTP handling across both services
- Examples: Both backend and frontend use Echo's `RegisterRoutes()`, middleware system
- Pattern: Centralized route registration, middleware composition (Logger, Recover)

**Proxy Middleware:**
- Purpose: Forward requests from frontend to backend without manipulation
- Examples: `frontend/internal/api/handlers.go` - `proxyConfigGenerator()`
- Pattern: Echo's built-in proxy middleware with round-robin balancer

## Entry Points

**Backend Service:**
- Location: `backend/cmd/pylon-proxy/main.go`
- Triggers: Application startup via Docker or direct execution
- Responsibilities: Initialize Echo server, register API routes, set up graceful shutdown

**Frontend Service:**
- Location: `frontend/cmd/pylon-proxy/main.go`
- Triggers: Application startup via Docker or direct execution
- Responsibilities: Initialize Echo server, register static asset serving and proxy routes, set up graceful shutdown

**Frontend Application:**
- Location: `frontend/assets/src/js/main.ts`
- Triggers: `DOMContentLoaded` event after HTML page loads
- Responsibilities: Initialize App class, set up router with route handlers, configure theme, attach event listeners

**Frontend Pages:**
- Home Page: `frontend/assets/src/js/pages/home.ts` - API key input form
- Issues Page: `frontend/assets/src/js/pages/issues.ts` - Issues list with filtering

## Error Handling

**Strategy:** Layered error propagation with HTTP status codes and user-facing error messages

**Patterns:**
- Backend handlers return HTTP status codes directly (200, 400, 401, 500, 503)
- Frontend API client throws JavaScript Error objects with descriptive messages
- Router catches handler errors and renders error page with fallback UI
- Health checks return 503 during graceful shutdown to signal load balancer
- Pylon API errors (non-200 responses) propagate as HTTP errors to frontend

**Specific Cases:**
- Invalid API key: Frontend detects 401 status, shows error, allows retry
- Missing API key: Frontend checks localStorage, redirects to home
- Network errors: API client catches and logs, shows generic error message
- JSON parsing errors: Handlers return 500 with error description

## Cross-Cutting Concerns

**Logging:**
- Echo middleware logs all HTTP requests/responses to stdout
- Initialization logs route registration and server startup
- Graceful shutdown logs state transitions and timing
- Client errors are logged with context before throwing

**Validation:**
- Frontend validates API key before making requests (non-empty string)
- Backend validates authorization header presence before proxying
- Backend filters issues by state and user/team IDs to match business rules
- URL query parameters are sanitized by Echo's parsing

**Authentication:**
- API key stored in localStorage on frontend (not secure for production)
- Authorization header passed as-is from frontend through backend to Pylon API
- Backend validates key presence but delegates actual validation to Pylon API
- 401 responses from Pylon trigger frontend re-authentication flow

---

*Architecture analysis: 2026-03-30*
