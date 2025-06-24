package api

import (
	"log"
	"net/http"
	"sync/atomic"

	"github.com/labstack/echo/v4"
)

var isShuttingDown atomic.Bool

func SetShuttingDown(value bool) {
	isShuttingDown.Store(value)
}

func HealthCheck(c echo.Context) error {
	shutdownStatus := isShuttingDown.Load()
	log.Printf("🩺 Health check called - shutdown status: %v", shutdownStatus)

	if shutdownStatus {
		log.Println("❌ Returning 503 - Service Unavailable")
		return c.String(http.StatusServiceUnavailable, "Shutting down")
	}
	log.Println("✅ Returning 200 - OK")
	return c.String(http.StatusOK, "Pong")
}
