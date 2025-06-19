package main

import (
	"cmp"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"slices"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// DATA STRUCTURES

// APIResponse is the top-level structure for the entire JSON object.
type APIResponse struct {
	Data       []User     `json:"data"`
	Pagination Pagination `json:"pagination"`
	RequestID  string     `json:"request_id"`
}

// User represents one of the user objects inside the "data" array.
type User struct {
	AvatarURL string   `json:"avatar_url"`
	Email     string   `json:"email"`
	Emails    []string `json:"emails"`
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	RoleID    string   `json:"role_id"`
	Status    string   `json:"status"`
}

// Pagination represents the pagination object.
type Pagination struct {
	Cursor      string `json:"cursor"`
	HasNextPage bool   `json:"has_next_page"`
}

type UserResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// AUXILIARY FUNCTIONS

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

// HANDLER FUNCTIONS
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

	var response APIResponse

	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return nil
	}

	users := make([]UserResponse, 0, len(response.Data))
	for _, user := range response.Data {
		if user.Email != "" {
			users = append(users, UserResponse{
				ID: user.ID,
				Name: user.Name,
			})
		}
	}

	slices.SortFunc(users, func(a, b UserResponse) int {
		return cmp.Compare(a.Name, b.Name)
	})

	return c.JSON(code, users)
}

func getTeams (c echo.Context) error {
	return c.String(http.StatusOK, "Teams")
}

func getIssuesWaitingOnUser (c echo.Context) error {
  return c.String(http.StatusOK, "Issues")
}

// MAIN FUNCTION
func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/api/health", healthCheck)
	e.GET("/api/users", getUsers)
	e.GET("/api/teams", getTeams)
	e.GET("/api/waiting", getIssuesWaitingOnUser)

	e.Logger.Fatal(e.Start(":8080"))
}
