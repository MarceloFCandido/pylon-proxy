package utils

import (
	"cmp"
	"slices"

	"pylon-proxy/backend/internal/models"
)

func SortIssues(issues []models.SimplifiedIssue) {
	slices.SortFunc(issues, func(a, b models.SimplifiedIssue) int {
		// sort VIP first
		if a.Account.VIP && !b.Account.VIP {
			return -1
		}
		if !a.Account.VIP && b.Account.VIP {
			return 1
		}

		// sort priorities descending
		priorities := []string{"low", "medium", "high", "urgent"}
		if slices.Index(priorities, a.Priority) > slices.Index(priorities, b.Priority) {
			return -1
		}
		if slices.Index(priorities, a.Priority) < slices.Index(priorities, b.Priority) {
			return 1
		}

		// lastly sort by last update time descending
		return cmp.Compare(b.LastUpdateTime, a.LastUpdateTime)
	})
}

func SortUsers(users []models.SimplifiedUser) {
	slices.SortFunc(users, func(a, b models.SimplifiedUser) int {
		return cmp.Compare(a.Name, b.Name)
	})
}

func SortTeams(teams []models.SimplifiedTeam) {
	slices.SortFunc(teams, func(a, b models.SimplifiedTeam) int {
		return cmp.Compare(a.Name, b.Name)
	})
}
