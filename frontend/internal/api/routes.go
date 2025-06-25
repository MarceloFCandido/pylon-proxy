package api

import (
	"log"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func RegisterRoutes(e *echo.Echo) {
	log.Println("📋 Registering API routes...")

	e.GET("/health", HealthCheck)
	e.Any("/api/*", func(c echo.Context) error { return nil }, middleware.ProxyWithConfig(proxyConfigGenerator()))

	log.Println("✅ Routes registered successfully")
}
