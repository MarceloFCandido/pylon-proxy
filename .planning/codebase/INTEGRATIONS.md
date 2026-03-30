# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**Pylon API:**
- Service: Pylon (https://api.usepylon.com) - Main external API for support team management
  - SDK/Client: Custom HTTP client implemented in `backend/internal/client/pylon.go`
  - Auth: Bearer token passed via Authorization header from frontend request
  - Endpoints:
    - `/users` - Fetch user list
    - `/teams` - Fetch team list
    - `/issues` - Fetch issues with time-based filtering (last 30 days)
    - `/accounts/{accountID}` - Fetch account details and VIP status

## Data Storage

**Databases:**
- Not detected - Application is stateless

**File Storage:**
- Local filesystem only - Frontend assets served from `dist/` directory
  - Generated during build at `frontend/assets/dist/`
  - Served by frontend Echo server from `dist/` directory via static file middleware

**Caching:**
- None - No persistent caching layer

**Session Management:**
- Client-side: Authorization token stored in browser local storage (`frontend/assets/src/js/storage.ts`)
- No server-side session storage

## Authentication & Identity

**Auth Provider:**
- Custom - Users provide Pylon API key directly in frontend UI
  - Implementation: Authorization header propagation
  - Flow:
    1. User inputs Pylon API key in frontend form
    2. Frontend stores key in local storage
    3. Frontend includes key in Authorization header for all API calls to backend
    4. Backend proxies calls to Pylon API with Authorization header intact
    5. Backend validates response from Pylon API

**Authorization:**
- Bearer token validation delegated to Pylon API
- No additional authorization layer beyond token validation from Pylon

## Monitoring & Observability

**Error Tracking:**
- Not detected - Application uses standard logging only

**Logs:**
- stdout/stderr logging via Echo middleware
  - Logger middleware for all HTTP requests (`backend/cmd/pylon-proxy/main.go` line 22)
  - Recover middleware for panic handling (`backend/cmd/pylon-proxy/main.go` line 23)
  - Custom log messages for startup, shutdown, and health checks
  - Log output includes emoji indicators for operational status

**Health Checks:**
- Endpoint: `GET /health` on both services
  - Backend: `http://localhost:8080/api/health`
  - Frontend: `http://localhost:8081/health`
  - Returns HTTP 200 (OK) during normal operation
  - Returns HTTP 503 (Service Unavailable) during graceful shutdown
  - Docker Compose health checks: 30-second interval, 5-second timeout, 3 retries

## CI/CD & Deployment

**Hosting:**
- Docker containerization for both services
  - Backend: Alpine 3.22 with Go binary
  - Frontend: Alpine 3.22 with Go binary + compiled assets
- Primary deployment platform: Porter
  - Configuration files: `backend/backend.porter.yaml`, `frontend/frontend.porter.yaml`
  - Preview environment configs: `backend/backend.preview.porter.yaml`, `frontend/frontend.preview.porter.yaml`

**CI Pipeline:**
- GitHub Actions workflows in `.github/workflows/`
  - Automated build and deployment on push
  - Separate workflows for backend and frontend services
  - Workflows handle Docker image building and push to container registry
  - Automated deployment to Porter platform

**Local Development:**
- Docker Compose orchestration via `docker-compose.yaml`
- Development startup script: `start-development.sh`
- Container resource limits: 0.1 CPU, 128MB memory per service
- Services communicate via Docker bridge network

## Environment Configuration

**Required env vars:**

Backend:
- No environment variables required (all configuration is hardcoded)

Frontend:
- `PROXY_URL` - URL to backend service (required for `/api/*` proxy routing)
  - Default: `http://localhost:8080`
  - Example production value: `https://backend.example.com`
- `SERVER_PORT` - Port for frontend server to listen on (optional)
  - Default: `:8081`

**Secrets location:**
- No secrets are stored server-side
- Pylon API key is provided by user at runtime via UI input
- User-provided API key stored in browser local storage (client-side only)

**Docker Compose Configuration:**
- Backend environment: Empty (no env vars)
- Frontend environment: `PROXY_URL=http://backend:8080` (Docker service discovery hostname)

## Webhooks & Callbacks

**Incoming:**
- Not detected - Application does not receive webhooks

**Outgoing:**
- Not detected - Application does not send webhooks

## Request Flow

**User Authentication Flow:**
1. User navigates to frontend (port 8081)
2. User enters Pylon API key in frontend form
3. Frontend stores key in browser local storage
4. Frontend includes Authorization header with key in all subsequent requests

**Data Fetch Flow (Example: Get Issues):**
1. Frontend: User selects user/team filters on `/issues` page
2. Frontend: Makes request to `GET /api/issues?user_id=X&team_id=Y` with Authorization header
3. Frontend server: Proxies request through to backend via `proxyConfigGenerator()` middleware
4. Backend: Receives request at `GET /api/issues` handler
5. Backend: Extracts Authorization header from request
6. Backend: Calls Pylon API endpoint `/issues` with query params and Authorization header
7. Backend: Unmarshals JSON response, filters by user/team ID and state="waiting_on_you"
8. Backend: For each matching issue, fetches account details via `/accounts/{accountID}` endpoint
9. Backend: Transforms response data (simplification: removes unnecessary fields)
10. Backend: Returns JSON array to frontend
11. Frontend: Renders issues in UI

**Service Interdependencies:**
- Frontend depends on Backend for API proxy
- Backend depends on Pylon API for all data
- No inter-service communication between backend and frontend beyond HTTP

---

*Integration audit: 2026-03-30*
