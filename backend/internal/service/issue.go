package service

import (
	"encoding/json"
	"fmt"
	"time"

	"pylon-proxy/backend/internal/client"
	"pylon-proxy/backend/internal/config"
	"pylon-proxy/backend/internal/models"
	"pylon-proxy/backend/pkg/utils"
)

func GetIssuesWaitingOnUser(userID, teamID, authorization string) ([]models.SimplifiedIssue, int, error) {
	code, body, err := client.DoRequest(models.RequestConfig{
		URL: config.PylonAPIBaseURL + "/issues",
		QueryParams: map[string]string{
			"start_time": time.Now().AddDate(0, 0, -30).Format(time.RFC3339),
			"end_time":   time.Now().Format(time.RFC3339),
		},
		Authorization: authorization,
	})
	if err != nil {
		return nil, code, err
	}

	var response models.IssuesAPIResponse
	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Printf("Error unmarshalling JSON: %v\n", err)
		return nil, code, err
	}

	accounts := make(map[string]models.SimplifiedAccount)
	issues := make([]models.SimplifiedIssue, 0, len(response.Data))

	for _, issue := range response.Data {
		if issue.Assignee.ID == userID && issue.Team.ID == teamID {
			if issue.State == "waiting_on_you" {
				if _, exists := accounts[issue.Account.ID]; !exists {
					name, isVIP := client.GetAccount(issue.Account.ID, authorization)
					accounts[issue.Account.ID] = models.SimplifiedAccount{
						Name: name,
						VIP:  isVIP,
					}
				}

				issues = append(issues, models.SimplifiedIssue{
					ID:             issue.Number,
					Account:        accounts[issue.Account.ID],
					LastUpdateTime: issue.LatestMessageTime,
					Priority:       issue.CustomFields["priority"].Value,
					Title:          issue.Title,
				})
			}
		}
	}

	utils.SortIssues(issues)

	return issues, code, nil
}
