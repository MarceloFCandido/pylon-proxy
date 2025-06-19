package main

import (
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func clientDoer(url string, authorization string) (int, []byte, error) {
	client := &http.Client{}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	req.Header.Add("Authorization", authorization)

	resp, err := client.Do(req)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	defer resp.Body.Close()

	respStatusCode := resp.StatusCode
	if respStatusCode != http.StatusOK {
		return respStatusCode, nil, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return respStatusCode, body, nil
}

func healthCheck (c echo.Context) error {
	return c.String(http.StatusOK, "Pong")
}

func getUsers (c echo.Context) error {
	url := "https://api.usepylon.com" + "/users"

	reqAuthorizationHeader := c.Request().Header.Get("Authorization")

	code, body, err := clientDoer(url, reqAuthorizationHeader)
	if err != nil {
		return c.String(code, err.Error())
	}

	return c.String(code, string(body))
}

func getTeams (c echo.Context) error {
	return c.String(http.StatusOK, "Teams")
}

func getIssuesWaitingOnUser (c echo.Context) error {
  return c.String(http.StatusOK, "Issues")
}

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/api/health", healthCheck)
	e.GET("/api/users", getUsers)
	e.GET("/api/teams", getTeams)
	e.GET("/api/waiting/:user", getIssuesWaitingOnUser)

	e.Logger.Fatal(e.Start(":8080"))
}
