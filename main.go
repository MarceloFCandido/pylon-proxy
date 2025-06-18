package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)



func healthCheck (c echo.Context) error {
	return c.String(http.StatusOK, "Pong")
}

func getIssuesWaitingOnMe (c echo.Context) error {
  return c.String(http.StatusOK, "Issues")
}

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/api/health", healthCheck)

	e.GET("/api/waiting", getIssuesWaitingOnMe)

	e.Logger.Fatal(e.Start(":8080"))
}
