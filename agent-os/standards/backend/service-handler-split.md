# Service vs Handler Responsibility Split

Logic is extracted to `service/` only when it needs to be shared across
multiple handlers. Single-use logic stays in the handler.

**Handler (api/):** Extract params, call service or client, return response.
```go
func GetIssuesWaitingOnUser(c echo.Context) error {
    userID := c.QueryParam("user_id")
    teamID := c.QueryParam("team_id")
    auth := c.Request().Header.Get("Authorization")

    issues, code, err := service.GetIssuesWaitingOnUser(userID, teamID, auth)
    if err != nil {
        return c.String(code, err.Error())
    }
    return c.JSON(code, issues)
}
```

**Service (service/):** Shared business logic, multi-step enrichment, filtering.

- Handlers must not contain filtering loops or enrichment logic
- `service/` functions receive raw params (IDs, auth string) and return simplified models
- `pkg/utils/` holds stateless helpers (sorting, formatting) used by both layers
