# Issue Sort Order

Issues are sorted by three criteria in priority order:

1. **VIP first** — issues from VIP accounts always appear at the top
2. **Priority descending** — `urgent > high > medium > low`
3. **Most recent update** — issues with the latest `LatestMessageTime` first

Sort logic lives in `backend/pkg/utils/sort.go` (`SortIssues`).

```go
priorities := []string{"low", "medium", "high", "urgent"}
// higher index = higher priority
```

- This order is a fixed product decision — don't change without discussion
- Future: user-configurable sort order via frontend input is planned
- When adding new sort criteria, insert them into `SortIssues` at the right precedence level
