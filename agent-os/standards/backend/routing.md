# Routing Conventions

All API endpoints use the `/api/` prefix. The Swagger UI uses `/docs` (no prefix)
because it's a human-facing browser page, not a machine endpoint.

```go
e.GET("/api/health", HealthCheck)
e.GET("/api/users", GetUsers)
e.GET("/api/teams", GetTeams)
e.GET("/api/waiting", GetIssuesWaitingOnUser)
e.GET("/api/openapi.yaml", ServeOpenAPISpec)
e.GET("/docs", ServeSwaggerUI) // exception: browser-facing page
```

- All new API routes must be under `/api/`
- OpenAPI spec lives at `/api/openapi.yaml`
- Human-facing pages (like Swagger UI) may use top-level paths
- All routes are registered in `backend/internal/api/routes.go`
