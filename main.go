package main

import (
	"cmp"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"slices"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// GLOBAL VARIABLES
var PYLON_API_BASE_URL string = "https://api.usepylon.com"

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

type IssuesAPIResponse struct {
	Data       []Issue `json:"data"`
	Pagination Pagination     `json:"pagination"`
	RequestID  string         `json:"request_id"`
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
	ID    string           `json:"id"`
	Name  string           `json:"name"`
	Users []SimplifiedUser `json:"users"`
}

type Issue struct {
	Account                           AccountInfo             `json:"account"`
	Assignee                          Person                  `json:"assignee"`
	BodyHTML                          string                  `json:"body_html"`
	BusinessHoursFirstResponseSeconds int                     `json:"business_hours_first_response_seconds"`
	BusinessHoursResolutionSeconds    int                     `json:"business_hours_resolution_seconds"`
	ChatWidgetInfo                    ChatWidgetInfo          `json:"chat_widget_info"`
	CreatedAt                         string                  `json:"created_at"`
	CSATResponses                     []CSATResponse          `json:"csat_responses"`
	CustomFields                      map[string]CustomField  `json:"custom_fields"`
	CustomerPortalVisible             bool                    `json:"customer_portal_visible"`
	ExternalIssues                    []ExternalIssue         `json:"external_issues"`
	FirstResponseSeconds              int                     `json:"first_response_seconds"`
	FirstResponseTime                 string                  `json:"first_response_time"`
	ID                                string                  `json:"id"`
	LatestMessageTime                 string                  `json:"latest_message_time"`
	Link                              string                  `json:"link"`
	Number                            int                     `json:"number"`
	NumberOfTouches                   int                     `json:"number_of_touches"`
	Requester                         Person                  `json:"requester"`
	ResolutionSeconds                 int                     `json:"resolution_seconds"`
	ResolutionTime                    string                  `json:"resolution_time"`
	Slack                             SlackInfo               `json:"slack"`
	SnoozedUntilTime                  string                  `json:"snoozed_until_time"`
	Source                            string                  `json:"source"`
	State                             string                  `json:"state"`
	Tags                              []string                `json:"tags"`
	Team                              TeamInfo                `json:"team"`
	Title                             string                  `json:"title"`
	Type                              string                  `json:"type"`
}

type AccountInfo struct {
	ID string `json:"id"`
}

type Person struct {
	Email string `json:"email"`
	ID    string `json:"id"`
}

type ChatWidgetInfo struct {
	PageURL string `json:"page_url"`
}

type CSATResponse struct {
	Comment string `json:"comment"`
	Score   int    `json:"score"`
}

type CustomField struct {
	Slug   string   `json:"slug"`
	Value  string   `json:"value"`
	Values []string `json:"values"`
}

type ExternalIssue struct {
	ExternalID string `json:"external_id"`
	Link       string `json:"link"`
	Source     string `json:"source"`
}

type SlackInfo struct {
	ChannelID string `json:"channel_id"`
	MessageTS string `json:"message_ts"`
}

type TeamInfo struct {
	ID string `json:"id"`
}

type SimplifiedUser struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SimplifiedTeam struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SimplifiedIssue struct {
	Account string `json:"account"`
	LastUpdateTime string `json:"last_update_time"`
	Priority string `json:"priority"`
	VIP bool   `json:"vip"`
}

type Pagination struct {
	Cursor      string `json:"cursor"`
	HasNextPage bool   `json:"has_next_page"`
}

type RequestConfig struct {
	Authorization string
	QueryParams   map[string]string
	URL           string
}

// AUXILIARY FUNCTIONS

func clientDoer(requestConfig RequestConfig) (int, []byte, error) {
	client := &http.Client{}

	req, err := http.NewRequest("GET", requestConfig.URL, nil)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	req.Header.Add("Authorization", requestConfig.Authorization)

	if requestConfig.QueryParams != nil {
		q := req.URL.Query()
		for key, value := range requestConfig.QueryParams {
			q.Add(key, value)
		}
		req.URL.RawQuery = q.Encode()
	}

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
func healthCheck(c echo.Context) error {
	return c.String(http.StatusOK, "Pong")
}

func getUsers(c echo.Context) error {
	url := PYLON_API_BASE_URL + "/users"

	reqAuthorizationHeader := c.Request().Header.Get("Authorization")

	code, body, err := clientDoer(RequestConfig{
		URL:           url,
		Authorization: reqAuthorizationHeader,
	})
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
				ID:   user.ID,
				Name: user.Name,
			})
		}
	}

	slices.SortFunc(users, func(a, b SimplifiedUser) int {
		return cmp.Compare(a.Name, b.Name)
	})

	return c.JSON(code, users)
}

func getTeams(c echo.Context) error {
	url := PYLON_API_BASE_URL + "/teams"

	reqAuthorizationHeader := c.Request().Header.Get("Authorization")

	code, body, err := clientDoer(RequestConfig{
		URL:           url,
		Authorization: reqAuthorizationHeader,
	})
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
			ID:   team.ID,
			Name: team.Name,
		})
	}

	slices.SortFunc(teams, func(a, b SimplifiedTeam) int {
		return cmp.Compare(a.Name, b.Name)
	})

	return c.JSON(code, teams)
}

func getIssuesWaitingOnUser(c echo.Context) error {
	url := PYLON_API_BASE_URL + "/issues"

	reqAuthorizationHeader := c.Request().Header.Get("Authorization")

	code, body, err := clientDoer(RequestConfig{
		URL:           url,
		QueryParams:   map[string]string{
			"start_time": time.Now().AddDate(0, 0, -30).Format(time.RFC3339),
			"end_time":   time.Now().Format(time.RFC3339),
		},
		Authorization: reqAuthorizationHeader,
	})
	if err != nil {
		return c.String(code, err.Error())
	}
	
	var response IssuesAPIResponse
	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		return nil
	}

	filters := map[string]string{"user_id": c.QueryParam("user_id"), "team_id": c.QueryParam("team_id")}

	issues := make([]SimplifiedIssue, 0, len(response.Data))
	for _, issue := range response.Data {
		if issue.Assignee.ID == filters["user_id"] || issue.Team.ID == filters["team_id"] {
			if issue.State == "waiting_on_you" {
				issues = append(issues, SimplifiedIssue{
					Account:         issue.Account.ID,
					LastUpdateTime:  issue.LatestMessageTime,
					Priority:        issue.CustomFields["priority"].Value,
					VIP:             true,
				})
			}
		}
	}

	return c.JSON(code, issues)
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
