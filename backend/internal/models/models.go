package models

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
	Data       []Issue    `json:"data"`
	Pagination Pagination `json:"pagination"`
	RequestID  string     `json:"request_id"`
}

type AccountAPIResponse struct {
	Data      Account `json:"data"`
	RequestID string  `json:"request_id"`
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
	Account                           AccountInfo            `json:"account"`
	Assignee                          Person                 `json:"assignee"`
	BodyHTML                          string                 `json:"body_html"`
	BusinessHoursFirstResponseSeconds int                    `json:"business_hours_first_response_seconds"`
	BusinessHoursResolutionSeconds    int                    `json:"business_hours_resolution_seconds"`
	ChatWidgetInfo                    ChatWidgetInfo         `json:"chat_widget_info"`
	CreatedAt                         string                 `json:"created_at"`
	CSATResponses                     []CSATResponse         `json:"csat_responses"`
	CustomFields                      map[string]CustomField `json:"custom_fields"`
	CustomerPortalVisible             bool                   `json:"customer_portal_visible"`
	ExternalIssues                    []ExternalIssue        `json:"external_issues"`
	FirstResponseSeconds              int                    `json:"first_response_seconds"`
	FirstResponseTime                 string                 `json:"first_response_time"`
	ID                                string                 `json:"id"`
	LatestMessageTime                 string                 `json:"latest_message_time"`
	Link                              string                 `json:"link"`
	Number                            int                    `json:"number"`
	NumberOfTouches                   int                    `json:"number_of_touches"`
	Requester                         Person                 `json:"requester"`
	ResolutionSeconds                 int                    `json:"resolution_seconds"`
	ResolutionTime                    string                 `json:"resolution_time"`
	Slack                             SlackInfo              `json:"slack"`
	SnoozedUntilTime                  string                 `json:"snoozed_until_time"`
	Source                            string                 `json:"source"`
	State                             string                 `json:"state"`
	Tags                              []string               `json:"tags"`
	Team                              TeamInfo               `json:"team"`
	Title                             string                 `json:"title"`
	Type                              string                 `json:"type"`
}

type Account struct {
	Channels                   []Channel              `json:"channels"`
	CreatedAt                  string                 `json:"created_at"`
	CRMSettings                CRMSettings            `json:"crm_settings"`
	CustomFields               map[string]CustomField `json:"custom_fields"`
	Domain                     string                 `json:"domain"`
	Domains                    []string               `json:"domains"`
	ExternalIDs                []ExternalID           `json:"external_ids"`
	ID                         string                 `json:"id"`
	LatestCustomerActivityTime string                 `json:"latest_customer_activity_time"`
	Name                       string                 `json:"name"`
	Owner                      Person                 `json:"owner"`
	PrimaryDomain              string                 `json:"primary_domain"`
	Tags                       []string               `json:"tags"`
	Type                       string                 `json:"type"`
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
	ID             int               `json:"id"`
	Account        SimplifiedAccount `json:"account"`
	LastUpdateTime string            `json:"last_update_time"`
	Priority       string            `json:"priority"`
	Title          string            `json:"title"`
}

type SimplifiedAccount struct {
	Name string `json:"name"`
	VIP  bool   `json:"vip"`
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

type Channel struct {
	ChannelID string `json:"channel_id"`
	IsPrimary bool   `json:"is_primary"`
	Source    string `json:"source"`
}

type CRMSettings struct {
	Details []CRMDetail `json:"details"`
}

type CRMDetail struct {
	ID     string `json:"id"`
	Source string `json:"source"`
}

type ExternalID struct {
	ExternalID string `json:"external_id"`
	Label      string `json:"label"`
}
