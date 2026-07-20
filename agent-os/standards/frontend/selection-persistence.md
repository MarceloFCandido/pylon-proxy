# Selection Persistence

User and team dropdown selections are persisted to `localStorage` immediately
on every change, and restored when the page loads. This is intentional UX:
mobile users should not need to re-select on every session.

```ts
// Save on change
select.addEventListener('change', (e) => {
  this.selectedUserId = target.value || null;
  if (this.selectedUserId) {
    this.storage.saveUser(this.selectedUserId);  // writes to localStorage
  }
});

// Restore on load
this.selectedUserId = this.storage.getUser();
this.selectedTeamId = this.storage.getTeam();
```

All `localStorage` access goes through the `Storage` class in `storage.ts`.
Never read/write `localStorage` directly in page components.

**Keys managed by `Storage`:**
- `pylon_api_key` — Pylon API key
- `pylon_user` — last selected user ID
- `pylon_team` — last selected team ID
