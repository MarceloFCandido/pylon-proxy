package api

import (
	"embed"
	"encoding/json"
	"fmt"
	"net/http"

	"apps/pylon-proxy/internal/client"
	"apps/pylon-proxy/internal/config"
	"apps/pylon-proxy/internal/models"
	"apps/pylon-proxy/internal/service"
	"apps/pylon-proxy/pkg/utils"

	"github.com/labstack/echo/v4"
)

//go:embed openapi.yaml swagger.html
var apiFiles embed.FS

func HealthCheck(c echo.Context) error {
	return c.String(http.StatusOK, "Pong")
}

func GetUsers(c echo.Context) error {
	url := config.PylonAPIBaseURL + "/users"

	reqAuthorizationHeader := c.Request().Header.Get("Authorization")

	code, body, err := client.DoRequest(models.RequestConfig{
		URL:           url,
		Authorization: reqAuthorizationHeader,
	})
	if err != nil {
		return c.String(code, err.Error())
	}

	var response models.UserAPIResponse

	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Printf("Error unmarshalling JSON: %v\n", err)
		return c.String(http.StatusInternalServerError, "Error unmarshalling JSON")
	}

	users := make([]models.SimplifiedUser, 0, len(response.Data))
	for _, user := range response.Data {
		if user.Email != "" {
			users = append(users, models.SimplifiedUser{
				ID:   user.ID,
				Name: user.Name,
			})
		}
	}

	utils.SortUsers(users)

	return c.JSON(code, users)
}

func GetTeams(c echo.Context) error {
	url := config.PylonAPIBaseURL + "/teams"

	reqAuthorizationHeader := c.Request().Header.Get("Authorization")

	code, body, err := client.DoRequest(models.RequestConfig{
		URL:           url,
		Authorization: reqAuthorizationHeader,
	})
	if err != nil {
		return c.String(code, err.Error())
	}

	var response models.TeamAPIResponse

	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Printf("Error unmarshalling JSON: %v\n", err)
		return c.String(http.StatusInternalServerError, "Error unmarshalling JSON")
	}

	teams := make([]models.SimplifiedTeam, 0, len(response.Data))
	for _, team := range response.Data {
		teams = append(teams, models.SimplifiedTeam{
			ID:   team.ID,
			Name: team.Name,
		})
	}

	utils.SortTeams(teams)

	return c.JSON(code, teams)
}

func GetIssuesWaitingOnUser(c echo.Context) error {
	reqAuthorizationHeader := c.Request().Header.Get("Authorization")
	userID := c.QueryParam("user_id")
	teamID := c.QueryParam("team_id")

	issues, code, err := service.GetIssuesWaitingOnUser(userID, teamID, reqAuthorizationHeader)
	if err != nil {
		return c.String(code, err.Error())
	}

	return c.JSON(code, issues)
}

func ServeOpenAPISpec(c echo.Context) error {
	content, err := apiFiles.ReadFile("openapi.yaml")
	if err != nil {
		return c.String(http.StatusNotFound, "OpenAPI spec not found")
	}

	c.Response().Header().Set("Content-Type", "application/x-yaml")
	return c.Blob(http.StatusOK, "application/x-yaml", content)
}

func ServeSwaggerUI(c echo.Context) error {
	content, err := apiFiles.ReadFile("swagger.html")
	if err != nil {
		return c.String(http.StatusNotFound, "Swagger UI not found")
	}

	return c.HTMLBlob(http.StatusOK, content)
}
