package api

import "github.com/labstack/echo/v4"

func RegisterRoutes(e *echo.Echo) {
	e.GET("/api/health", HealthCheck)
	e.GET("/api/users", GetUsers)
	e.GET("/api/teams", GetTeams)
	e.GET("/api/waiting", GetIssuesWaitingOnUser)

	// API documentation endpoints
	e.GET("/api/openapi.yaml", ServeOpenAPISpec)
	e.GET("/docs", ServeSwaggerUI)
}
