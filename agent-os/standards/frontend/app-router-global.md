# window.appRouter Global

The router is exposed as `window.appRouter` so page components can trigger
programmatic navigation (e.g., after saving an API key).

```ts
// Set in main.ts at startup
window.appRouter = this.router;

// Used in page components for post-action navigation
if (window.appRouter) {
  window.appRouter.navigate('/issues');
}
```

- Always null-check before using: `if (window.appRouter) { ... }`
- `window.appRouter` is initialized in `main.ts` before any pages load
- Do not create additional global router references — use this one
- For link-based navigation, prefer `data-route` attributes over `window.appRouter` directly
