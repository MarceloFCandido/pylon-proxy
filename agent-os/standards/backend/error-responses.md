# Error Responses

Errors are currently returned as plain text strings using `c.String(code, msg)`.
This evolved organically and may be migrated to JSON in future.

```go
// Upstream error: propagate status code + message as plain text
if err != nil {
    return c.String(code, err.Error())
}

// JSON parse error: always 500
if err := json.Unmarshal(body, &response); err != nil {
    return c.String(http.StatusInternalServerError, "Error unmarshalling JSON")
}
```

- Upstream errors propagate the original status code from Pylon
- JSON unmarshal errors always return 500 with a fixed string (full error logged server-side)
- Do not return internal error details to the client
- Future: consider migrating to `{ "error": "..." }` JSON envelope for consistency
