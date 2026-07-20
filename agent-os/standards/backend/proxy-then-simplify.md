# Proxy-then-Simplify Pattern

Handlers fetch the full Pylon API response, unmarshal into a complete model,
then transform to a `Simplified*` struct that contains only what the frontend needs.

```go
// 1. Fetch from Pylon
code, body, err := client.DoRequest(models.RequestConfig{...})

// 2. Unmarshal into full model (mirrors Pylon response)
var response models.UserAPIResponse
json.Unmarshal(body, &response)

// 3. Transform to simplified model (only fields the UI uses)
users := make([]models.SimplifiedUser, 0, len(response.Data))
for _, user := range response.Data {
    users = append(users, models.SimplifiedUser{
        ID:   user.ID,
        Name: user.Name,
    })
}
return c.JSON(code, users)
```

**Naming convention:** Full models mirror Pylon's schema (e.g. `User`, `Team`).
Simplified models are prefixed with `Simplified` (e.g. `SimplifiedUser`, `SimplifiedTeam`).

- Define both model types in `backend/internal/models/models.go`
- Never return raw Pylon responses to the frontend
- Only add fields to `Simplified*` structs that the frontend actually renders
