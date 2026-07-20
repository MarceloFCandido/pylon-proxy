# Page Lifecycle (Two-Phase)

Pages implement the `PageComponent` interface with two methods that run at
different times:

**Phase 1 — `render()`:** Returns a static HTML string. Called by the router,
which injects it via `innerHTML`. Must be synchronous.

**Phase 2 — `setupEventListeners()`:** Wires up event listeners and loads data.
Called after the `routechange` event fires (i.e., after HTML is in the DOM).

```ts
// At the bottom of each page file:
window.addEventListener('routechange', ((e: CustomEvent<{ path: string }>) => {
  if (e.detail.path === '/your-route') {
    setTimeout(async () => {
      const storage = new Storage();
      const page = new YourPage(storage);
      await page.setupEventListeners();
    }, 100); // wait for DOM
  }
}) as EventListener);
```

- Never attach event listeners inside `render()` — the DOM doesn't exist yet
- Show skeleton placeholders in `render()` for content loaded async in `setupEventListeners()`
- The 100ms timeout gives the router time to inject HTML before listeners are attached
