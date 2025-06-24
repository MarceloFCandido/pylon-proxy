package api

import (
	"log"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	log.Println("📋 Registering API routes...")
	e.GET("/health", HealthCheck)
	log.Println("✅ Routes registered successfully")
}
