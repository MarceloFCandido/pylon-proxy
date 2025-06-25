package api

import (
	"log"
	"net/http"
	"net/url"
	"sync/atomic"

	"pylon-proxy/frontend/internal/config"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

func proxyConfigGenerator() middleware.ProxyConfig {
	backendURL, err := url.Parse(config.ProxyURL)
	if err != nil {
		log.Fatalln("Failed to parse backendproxy URL: ", err)
	}

	proxyConfig := middleware.ProxyConfig{
		Balancer: middleware.NewRoundRobinBalancer([]*middleware.ProxyTarget{
			{
				Name: "proxy",
				URL:  backendURL,
			},
		}),
	}

	return proxyConfig
}
