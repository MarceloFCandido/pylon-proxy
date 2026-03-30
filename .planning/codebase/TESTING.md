# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Framework

**Status:** Not Implemented

No testing frameworks are currently configured in this codebase. The project has no test dependencies or test files present.

**TypeScript Frontend:**
- No jest, vitest, mocha, or other test runners configured
- No assertions library (chai, expect, etc.)
- No test files found in codebase

**Go Backend:**
- No testing configuration in `go.mod`
- No test files present (`*_test.go` files)
- No test runner scripts in `go.mod` or Makefile

## Test File Organization

**Current Status:**
- No test files exist in the codebase
- No test directories created

**Recommended Pattern (if tests were added):**

**TypeScript:**
- Co-located tests: `*.test.ts` or `*.spec.ts` in same directory as source
- Example structure:
  ```
  src/
  ├── js/
  │   ├── api.ts
  │   ├── api.test.ts
  │   ├── router.ts
  │   ├── router.test.ts
  │   └── pages/
  │       ├── home.ts
  │       └── home.test.ts
  └── types/
      └── api.ts
  ```

**Go:**
- Co-located tests: `*_test.go` in same package
- Example structure:
  ```
  internal/
  ├── service/
  │   ├── issue.go
  │   └── issue_test.go
  ├── client/
  │   ├── pylon.go
  │   └── pylon_test.go
  └── api/
      ├── handlers.go
      └── handlers_test.go
  ```

## Run Commands (If Tests Were Configured)

**TypeScript (would require jest or vitest):**
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode for development
npm run test:coverage    # Generate coverage report
```

**Go (standard testing):**
```bash
go test ./...            # Run all tests
go test -v ./...         # Run with verbose output
go test -cover ./...     # Show coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## Test Structure (Template)

### TypeScript Pattern (if implemented)

```typescript
// Example: src/js/api.test.ts
import { ApiClient } from './api';
import { Storage } from './storage';

describe('ApiClient', () => {
  let storage: Storage;
  let client: ApiClient;

  beforeEach(() => {
    // Setup
    storage = new Storage();
    client = new ApiClient(storage);
  });

  afterEach(() => {
    // Cleanup
    localStorage.clear();
  });

  describe('testApiKey', () => {
    it('should return true for valid API key', async () => {
      const result = await client.testApiKey('valid-key');
      expect(result).toBe(true);
    });

    it('should return false for invalid API key', async () => {
      const result = await client.testApiKey('invalid-key');
      expect(result).toBe(false);
    });
  });
});
```

### Go Pattern (if implemented)

```go
// Example: internal/service/issue_test.go
package service

import (
	"testing"
	"pylon-proxy/backend/internal/models"
)

func TestGetIssuesWaitingOnUser(t *testing.T) {
	tests := []struct {
		name    string
		userID  string
		teamID  string
		wantErr bool
	}{
		{
			name:    "get issues for user",
			userID:  "user-123",
			teamID:  "",
			wantErr: false,
		},
		{
			name:    "invalid authorization",
			userID:  "user-123",
			teamID:  "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, _, err := GetIssuesWaitingOnUser(tt.userID, tt.teamID, "")
			if (err != nil) != tt.wantErr {
				t.Errorf("GetIssuesWaitingOnUser() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
```

## Mocking Requirements

**TypeScript:**
- Would need jest or vitest with built-in mocking
- Mock targets:
  - `fetch()` API calls (via jest-fetch-mock or vitest mocking)
  - `localStorage` (manual implementation or jest mocking)
  - DOM queries (manual test doubles)

**Go:**
- Would need interface-based design for mocking
- Current code uses concrete types (e.g., `http.Client`), not interfaces
- Mock targets:
  - HTTP client (wrap in interface)
  - Config lookups

**Example Go mocking pattern (if refactored):**
```go
// Current pattern (hard to mock):
func DoRequest(requestConfig RequestConfig) (int, []byte, error) {
  client := &http.Client{}
  // ...
}

// Better pattern for testing:
type HTTPClient interface {
  Do(req *http.Request) (*http.Response, error)
}

func DoRequest(client HTTPClient, requestConfig RequestConfig) (int, []byte, error) {
  // ...
}
```

## What to Test (Recommended)

### TypeScript Frontend
**High Priority:**
- API Client methods: `testApiKey()`, `getUsers()`, `getTeams()`, `getIssuesWaitingOnUser()`
- Storage operations: `saveApiKey()`, `getApiKey()`, `clearApiKey()`, `hasApiKey()`
- Router navigation: `navigate()`, `handleRoute()`, `addRoute()`
- Error handling in async operations

**Medium Priority:**
- Page component rendering and initialization
- DOM element creation and updates
- Theme toggling and persistence
- Event listener attachment and cleanup

**Low Priority:**
- Date formatting in `formatRelativeTime()`
- Styling and CSS class application
- Console logging

### Go Backend
**High Priority:**
- API handlers: `GetUsers()`, `GetTeams()`, `GetIssuesWaitingOnUser()`, `HealthCheck()`
- Issue filtering and sorting logic in `GetIssuesWaitingOnUser()`
- HTTP client request building in `DoRequest()`
- JSON unmarshalling and error handling

**Medium Priority:**
- Account VIP status detection in `GetAccount()`
- Route registration in `RegisterRoutes()`
- Graceful shutdown signal handling

**Low Priority:**
- Logging output
- HTTP status code returns
- Server startup

## What NOT to Test

**TypeScript:**
- DOM manipulation internals (focus on behavior)
- Third-party library implementations (fetch, localStorage)
- HTML string generation for rendering (verify final result instead)
- Theme system internals (test save/load behavior)

**Go:**
- External API responses (mock them)
- HTTP framework internals (echo framework)
- Logging output format
- Shell signal handling

## Coverage Goals (Recommended)

**TypeScript:**
- Target: 70%+ coverage
- Priority: Core API client, storage, router navigation
- Exceptions: Rendering code, debug logging

**Go:**
- Target: 80%+ coverage
- Priority: Business logic (issue filtering, sorting), API handlers
- Exceptions: Health checks, logging, error formatting

## Manual Testing Approach (Current)

Since no automated tests exist, testing is currently manual:

**Frontend Testing:**
1. Start development server: `npm run dev` from `frontend/assets/`
2. Manual browser testing at http://localhost:8080
3. Test workflows:
   - Enter API key → validation → navigation to /issues
   - Select user/team → load issues
   - Theme toggle → persistence check
   - Invalid API key handling

**Backend Testing:**
1. Start server: go run from `backend/cmd/pylon-proxy/`
2. Manual API testing:
   - Health check: `curl http://localhost:8080/api/health`
   - Get users: `curl -H "Authorization: Bearer <KEY>" http://localhost:8080/api/users`
   - Get teams: `curl -H "Authorization: Bearer <KEY>" http://localhost:8080/api/teams`
   - Get issues: `curl -H "Authorization: Bearer <KEY>" 'http://localhost:8080/api/waiting?user_id=<ID>'`

## Test Configuration (Not Present)

**Missing Jest Config (if added):**
- File: `jest.config.js` in `frontend/assets/`
- Would configure: Test environment (jsdom), transform (ts-jest), coverage thresholds

**Missing Vitest Config (if added):**
- File: `vitest.config.ts` in `frontend/assets/`
- Would configure: TypeScript support, browser environment

**Missing Go Test Flags:**
- Coverage reporting setup
- Race condition detection (`-race`)
- Timeout configuration (`-timeout`)

## Integration Testing Gaps

**API Integration:**
- No E2E tests for full request flow (frontend → backend → Pylon API)
- Manual testing required to verify:
  - Frontend authentication flow
  - Backend API key validation
  - Issue filtering and sorting end-to-end

**Database/Storage:**
- No persistence testing (localStorage in frontend)
- No backend state management tests

## Async Testing Notes

If tests were added, async patterns to test:

**TypeScript:**
```typescript
// Pattern used throughout codebase
async methodName(): Promise<ReturnType> {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Test pattern (pseudo-code):
it('should handle async operation', async () => {
  const result = await methodName();
  expect(result).toBeDefined();
});

it('should handle async errors', async () => {
  await expect(methodName()).rejects.toThrow();
});
```

**Go:**
```go
// Pattern used in handlers
func HandleRequest(c echo.Context) error {
  code, body, err := client.DoRequest(config)
  if err != nil {
    return c.String(code, err.Error())
  }
  return c.JSON(code, result)
}

// Test pattern:
func TestHandleRequest(t *testing.T) {
  // Would need to mock echo.Context and DoRequest
  // Test error cases and success cases
}
```

