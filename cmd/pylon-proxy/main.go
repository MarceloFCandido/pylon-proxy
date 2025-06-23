package main

import (
	"apps/pylon-proxy/internal/api"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	api.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":8080"))
}
