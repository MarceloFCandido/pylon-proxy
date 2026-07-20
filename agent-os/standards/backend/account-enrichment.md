# Account Enrichment in Issue Lists

When building issue lists, account details (name, VIP status) are fetched
from Pylon and cached in a local map keyed by account ID to avoid duplicate
API calls within the same request.

```go
accounts := make(map[string]models.SimplifiedAccount)

for _, issue := range response.Data {
    if _, exists := accounts[issue.Account.ID]; !exists {
        name, isVIP := client.GetAccount(issue.Account.ID, authorization)
        accounts[issue.Account.ID] = models.SimplifiedAccount{
            Name: name,
            VIP:  isVIP,
        }
    }
    // use accounts[issue.Account.ID]
}
```

- This is specific to `GetIssuesWaitingOnUser` — not a general convention
- VIP is determined by the `"VIP"` tag on the Pylon account
- The cache is request-scoped (not shared across requests)
