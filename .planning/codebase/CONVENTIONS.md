# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files:**
- TypeScript/TSX files: `camelCase.ts` or `PascalCase.ts` for class exports
- Go files: `snake_case.go` (e.g., `pylon.go`, `issue.go`, `handlers.go`)
- Component files: `camelCase.ts` with default export (e.g., `home.ts`, `issues.ts`)
- Type/interface files: `api.ts`, `app.ts`, `dom.ts`, `index.ts`

**Functions:**
- TypeScript: `camelCase` for regular functions and methods
  - Async functions: `async methodName(): Promise<ReturnType>`
  - Private methods: `private methodName(): void`
  - Example: `handleRoute()`, `updateActiveLink()`, `renderUserSelect()`
- Go: `PascalCase` for exported functions, `camelCase` for unexported
  - Examples: `DoRequest()`, `GetAccount()`, `GetIssuesWaitingOnUser()`, `sortByPriority()`
- Event handlers: `handle<Action>` pattern (e.g., `handleSubmit()`, `handleRoute()`, `handleClear()`)
- Render methods: `render<Component>` pattern (e.g., `renderUserSelect()`, `renderIssues()`, `render404()`)
- Private helper methods: `private <verb><Noun>()` (e.g., `updateRefreshButtonState()`, `formatRelativeTime()`)

**Variables:**
- TypeScript: `camelCase` for all variables and properties
  - HTML elements cached as variables: `const element = document.getElementById('id')` with null checks
  - Boolean flags: `hasPendingChanges`, `shutdownStatus`, `isVIP`
  - Collections: `users`, `teams`, `issues` (plural nouns)
  - Example: `selectedUserId`, `apiKey`, `contentElement`
- Go: `PascalCase` for exported struct fields, `camelCase` for unexported
  - Map keys: `snake_case` (e.g., `user_id`, `team_id`, `start_time`)
  - Example: `respStatusCode`, `reqAuthorizationHeader`, `accounts`

**Types:**
- TypeScript interfaces: `PascalCase` with suffix pattern
  - Request/Response types: `<Domain>APIResponse` (e.g., `UserAPIResponse`, `IssuesAPIResponse`)
  - Component interfaces: `<Name>Component` (e.g., `PageComponent`)
  - Handler types: `<Action>Handler` (e.g., `RouteHandler`, `ClickHandler`)
  - Config types: `<Name>Config` (e.g., `RouterConfig`, `RequestConfig`)
  - Simplified/internal models: `Simplified<Entity>` (e.g., `SimplifiedUser`, `SimplifiedIssue`)
- Go: `PascalCase` for all struct types (exported by convention)
  - API response types: `<Entity>APIResponse` (e.g., `UserAPIResponse`)
  - Model types: `<Entity>` (e.g., `User`, `Team`, `Issue`)

**Constants:**
- Go: `PascalCase` for exported, `camelCase` for unexported
  - Example: `PylonAPIBaseURL`, `ServerPort`
- TypeScript: `UPPER_SNAKE_CASE` for true constants, `camelCase` for readonly class properties
  - Example in Storage class: `API_KEY`, `TEAM_KEY`, `USER_KEY`

## Code Style

**Formatting:**
- TypeScript: Uses Webpack + TypeScript for bundling, no explicit prettier/eslint config found
  - Line length: No hard limit enforced
  - Indentation: 2 spaces (inferred from code)
  - Semicolons: Used
- Go: Standard Go formatting conventions (gofmt implicit)
  - Indentation: 1 tab
  - Semicolons: Not used (Go style)

**Linting:**
- TypeScript: ESLint configured in `package.json` at `frontend/assets/`
  - Run command: `npm run lint` executes `tsc --noEmit && eslint 'src/**/*.{ts,tsx}'`
  - TypeScript strict mode enabled: All strict checks are on
- Go: No explicit linter configured, follows standard Go conventions

**Type Checking:**
- TypeScript: Strict mode enabled in `tsconfig.json`
  - `strict: true` with all sub-options enabled
  - `noUnusedLocals: true`, `noUnusedParameters: true`, `noImplicitReturns: true`
  - `noUncheckedIndexedAccess: true` - strict object key access
  - Type annotations required on function parameters and returns (inferred from code patterns)

## Import Organization

**Order:**
1. External packages and libraries (e.g., `github.com/...`, npm packages)
2. Internal packages from current project (e.g., `pylon-proxy/backend/internal/...`)
3. Relative imports from same package

**Path Aliases:**
- TypeScript: `@/*` resolves to `src/` (configured in `tsconfig.json` with `baseUrl: ./src`)
  - Usage: `import { Theme } from '@/types'`, `import { Storage } from '@/js/storage'`
- Go: No path aliases, uses full import paths with module prefix

**Barrel Files:**
- `types/index.ts`: Re-exports all types for convenient importing
  - Pattern: `export * from './api'`, `export * from './app'`, `export * from './dom'`
  - Allows: `import { User, Team, Issue } from '@/types'`

## Error Handling

**Patterns:**
- TypeScript:
  - Try-catch blocks for async operations: `try { ... } catch (error) { console.error(...) }`
  - Type assertions with casting: `error as Error`
  - Error logging: `console.error('Context:', error)`
  - User-facing errors: Show in UI with `.showMessage()` method
  - Network errors: Wrapped in try-catch with user-friendly messages
- Go:
  - Error returns as second value: `func Name() (T, error)`
  - Error checks inline: `if err != nil { return ..., err }`
  - Status codes returned: `return statusCode, body, error`
  - Log on error: `fmt.Printf("Error ...: %v\n", err)` or `log.Println("...Error...", err)`

**Example patterns:**
```typescript
// TypeScript error handling
try {
  const response = await this.apiClient.request();
} catch (error) {
  console.error('Context message:', error);
  this.showMessage('User message', 'error');
}

// Go error handling
if err != nil {
  fmt.Printf("Error unmarshalling JSON: %v\n", err)
  return c.String(http.StatusInternalServerError, "Error message")
}
```

## Logging

**Framework:**
- TypeScript: `console.*` (no logging framework)
  - Methods used: `console.error()`, `console.log()`
  - Format: Direct string messages with variables
- Go: `log` package from stdlib
  - Usage: `log.Println()`, `log.Printf()`
  - Emojis used for visual distinction: 🚀, ✅, ❌, 🔄, ⏳, 👋

**Patterns:**
- Log errors with context: `console.error('API request error:', error)`
- Log in catch blocks for debugging
- Log state changes for monitoring (Go): `log.Println("🩺 Health check called...")`, `log.Println("❌ Server start error...")`
- No debug logging levels enforced

## Comments

**When to Comment:**
- TypeScript: Header comments on files explaining purpose, method comments explaining complex logic
  - File headers: `// <Component> for <Purpose> with TypeScript`
  - Method comments: Above private methods explaining behavior
  - Inline comments: For non-obvious logic (e.g., animation delays, state transitions)
- Go: Comments above package, functions, and complex logic blocks
  - Package comment: None currently
  - Function comments: Above exported functions (not consistently applied)
  - Inline: For non-obvious logic (e.g., sorting keys, state checks)

**JSDoc/TSDoc:**
- Not used in this codebase
- No type hints in comments (uses TypeScript types instead)

## Function Design

**Size:**
- Smaller methods preferred: 10-20 lines typical
- Longer methods for complex rendering: `renderIssues()` ~20 lines, `handleSubmit()` ~70 lines
- Private helpers extracted for reusability

**Parameters:**
- Limited parameters (typically 1-3)
- Storage passed to constructors rather than as parameters
- Configuration objects used when needed (e.g., `RequestConfig`)
- Optional parameters typed with `?` (e.g., `userID?: string`)

**Return Values:**
- Async methods: Promise-based
  - `Promise<T>` for async operations
  - Return types explicitly typed: `async loadIssues(): Promise<void>`
  - Implicit void returns for side-effect operations
- Sync methods: Direct returns
  - Boolean for validation: `testApiKey(): Promise<boolean>`
  - String for rendering: `render(): string`
  - Collections with generic typing: `Promise<User[]>`

## Module Design

**Exports:**
- TypeScript:
  - Named exports for interfaces/types: `export interface User { ... }`
  - Default exports for classes: `export default class HomePage { ... }`
  - Class-based components implementing `PageComponent` interface
- Go:
  - Package-level functions: Exported PascalCase
  - Internal functions: camelCase (unexported)
  - No interface exports (types defined at module level)

**Barrel Files:**
- `src/types/index.ts` collects all type exports for convenient importing
- `src/js/` files imported directly or via path alias

## Class Patterns

**Class Structure (TypeScript):**
- Private fields: Declared at top with type annotations and access modifier
- Constructor: Initializes all private fields
- Public methods: Organized by responsibility (render, setup, data loading, helpers)
- Private methods: At bottom, prefixed with `private` keyword
- Lifecycle: Pages implement `PageComponent { render(): string; destroy?(): void; }`

**Example:**
```typescript
export default class HomePage implements PageComponent {
  private storage: Storage;
  private apiClient: ApiClient;

  constructor(storage: Storage) {
    this.storage = storage;
    this.apiClient = new ApiClient(storage);
  }

  render(): string { /* ... */ }
  setupEventListeners(): void { /* ... */ }
  private handleSubmit(): void { /* ... */ }
  private showMessage(): void { /* ... */ }
}
```

## Async Patterns

**Promise handling:**
- `async/await` preferred over `.then()` chains
- Error handling: Try-catch blocks
- Parallel operations: `Promise.all([...])` for independent requests
- Sequential: Direct `await` statements
- Loading states: UI updates before async call, restored in finally block

## Null/Undefined Handling

**TypeScript:**
- DOM queries: Null-coalescing with `as | null` type assertions
  - Pattern: `document.getElementById('id') as HTMLElement | null`
  - Null checks before use: `if (element) { element.innerHTML = ... }`
  - Use optional chaining: `element?.classList.add('active')`
- Nullable types: `string | null` in function signatures
- Default values: Constructor initialization, parameter defaults

**Go:**
- Standard nil checks: `if value == nil { ... }`
- Explicit error returns
- No optional/nullable types (uses pointers when needed)

