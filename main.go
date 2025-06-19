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

type UserAPIResponse struct {
	Data       []User     `json:"data"`
	Pagination Pagination `json:"pagination"`
	RequestID  string     `json:"request_id"`
}

type TeamAPIResponse struct {
	Data       []Team     `json:"data"`
	Pagination Pagination `json:"pagination"`
	RequestID  string     `json:"request_id"`
}

type User struct {
	AvatarURL string   `json:"avatar_url"`
	Email     string   `json:"email"`
	Emails    []string `json:"emails"`
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	RoleID    string   `json:"role_id"`
	Status    string   `json:"status"`
}

type Team struct {
	ID    string     `json:"id"`
	Name  string     `json:"name"`
	Users []SimplifiedUser `json:"users"`
}

type SimplifiedUser struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SimplifiedTeam struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Pagination struct {
	Cursor      string `json:"cursor"`
	HasNextPage bool   `json:"has_next_page"`
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

	var response UserAPIResponse

	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return nil
	}

	users := make([]SimplifiedUser, 0, len(response.Data))
	for _, user := range response.Data {
		if user.Email != "" {
			users = append(users, SimplifiedUser{
				ID: user.ID,
				Name: user.Name,
			})
		}
	}

	slices.SortFunc(users, func(a, b SimplifiedUser) int {
		return cmp.Compare(a.Name, b.Name)
	})

	return c.JSON(code, users)
}

func getTeams (c echo.Context) error {
	url := "https://api.usepylon.com" + "/teams"

	reqAuthorizationHeader := c.Request().Header.Get("Authorization")

	code, body, err := clientDoer(url, reqAuthorizationHeader)
	if err != nil {
		return c.String(code, err.Error())
	}

	var response TeamAPIResponse

	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return nil
	}

	teams := make([]SimplifiedTeam, 0, len(response.Data))
	for _, team := range response.Data {
		teams = append(teams, SimplifiedTeam{
			ID: team.ID,
			Name: team.Name,
		})
	}

	slices.SortFunc(teams, func(a, b SimplifiedTeam) int {
		return cmp.Compare(a.Name, b.Name)
	})

	return c.JSON(code, teams)
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
