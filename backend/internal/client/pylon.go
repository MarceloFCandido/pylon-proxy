package client

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"slices"

	"pylon-proxy/backend/internal/config"
	"pylon-proxy/backend/internal/models"
)

func DoRequest(requestConfig models.RequestConfig) (int, []byte, error) {
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

func GetAccount(accountID string, authorization string) (string, bool) {
	_, body, err := DoRequest(models.RequestConfig{
		URL:           config.PylonAPIBaseURL + "/accounts/" + accountID,
		Authorization: authorization,
	})
	if err != nil {
		fmt.Printf("Error fetching account VIP status: %v\n", err)
		os.Exit(1)
	}

	var response models.AccountAPIResponse
	if err := json.Unmarshal([]byte(body), &response); err != nil {
		fmt.Printf("Error unmarshalling JSON: %v\n", err)
		os.Exit(1)
	}

	name := response.Data.Name
	isVIP := response.Data.Tags != nil && slices.Contains(response.Data.Tags, "VIP 🌟")

	return name, isVIP
}
