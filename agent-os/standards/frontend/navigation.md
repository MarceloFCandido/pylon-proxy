# SPA Navigation

Internal navigation uses `data-route` attributes, not `href`. A global click
handler in `main.ts` intercepts these and calls `router.navigate()` to avoid
full page reloads.

```html
<!-- Internal SPA link -->
<a data-route="/issues">Go to Issues</a>
<button data-route="/">Home</button>

<!-- External link (normal href is fine) -->
<a href="https://external.example.com" target="_blank">External</a>
```

```ts
// Global handler in main.ts (already set up — don't duplicate)
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.matches('[data-route]')) {
    e.preventDefault();
    router.navigate(target.getAttribute('data-route'));
  }
});
```

- All in-app links must use `data-route`, never `href` for internal routes
- Using `href` on internal links causes a full page reload
- The active nav link is highlighted via `.active` class on `.nav-link` elements
  with matching `data-route`
