package config

import "os"

const (
	DefaultProxyURL   = "http://localhost:8080"
	DefaultServerPort = ":8081"
)

var (
	ProxyURL   string
	ServerPort string
)

func init() {
	ProxyURL = getEnv("PROXY_URL", DefaultProxyURL)
	ServerPort = getEnv("SERVER_PORT", DefaultServerPort)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}