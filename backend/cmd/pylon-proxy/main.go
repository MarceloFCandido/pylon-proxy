package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pylon-proxy/backend/internal/api"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	api.RegisterRoutes(e)

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Channel to coordinate shutdown completion
	done := make(chan bool, 1)

	go func() {
		<-quit
		log.Println("🔄 Shutdown signal received, starting graceful shutdown...")
		api.SetShuttingDown(true)
		log.Println("❌ Health checks now returning 503 - waiting for load balancer update...")
		// Wait a bit before shutting down to allow health checks to update
		time.Sleep(25 * time.Second)
		log.Println("⏳ Grace period complete, shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := e.Shutdown(ctx); err != nil {
			log.Printf("❌ Shutdown error: %v", err)
		} else {
			log.Println("✅ Server shutdown completed successfully")
		}
		done <- true
	}()

	// Start server
	log.Println("🚀 Starting server on :8080")
	if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
		log.Fatalf("❌ Server start error: %v", err)
	}

	// Wait for graceful shutdown to complete
	<-done
	log.Println("👋 Application exited cleanly")
}
