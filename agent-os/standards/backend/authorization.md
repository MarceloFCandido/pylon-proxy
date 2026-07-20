# Authorization Pass-Through

The backend never validates or owns API keys. The `Authorization` header
from the incoming request is forwarded unchanged to the Pylon API on every
outbound call.

```go
reqAuthorizationHeader := c.Request().Header.Get("Authorization")
client.DoRequest(models.RequestConfig{
    URL:           url,
    Authorization: reqAuthorizationHeader,
})
```

**Auth flow:**
1. User enters key in the UI → frontend JS validates it via `GET /api/users`
   (401 = invalid, 200 = valid) before saving to `localStorage`
2. All subsequent requests send `Authorization: Bearer {key}`
3. Frontend Go server proxies request to backend unchanged
4. Backend reads header and passes it to Pylon API, which enforces auth

- Never add server-side key validation in the backend — Pylon owns that
- 401 responses from Pylon propagate naturally through the proxy
- Each caller uses their own Pylon key; the backend holds no shared key
