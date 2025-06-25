package api

import (
	"log"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func RegisterRoutes(e *echo.Echo) {
	log.Println("📋 Registering API routes...")

	e.Static("/", "dist")
	e.GET("/health", HealthCheck)
	e.Any("/api/*", func(c echo.Context) error { return nil }, middleware.ProxyWithConfig(proxyConfigGenerator()))

	// Add specific routes for SPA navigation
	// This handles direct access to SPA routes like /issues
	e.GET("/issues", func(c echo.Context) error {
		return c.File("dist/index.html")
	})

	log.Println("✅ Routes registered successfully")
}
