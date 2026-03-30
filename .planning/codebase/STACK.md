# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- Go 1.24.4 - Backend API server and frontend web server
- TypeScript 5.3.3 - Frontend single-page application source code
- JavaScript - Build tooling and webpack configuration
- HTML5 - Frontend templates and markup
- CSS3 - Frontend styling with PostCSS processing

**Build-time:**
- Webpack 5.89.0 - Frontend bundling and asset pipeline

## Runtime

**Environment:**
- Go runtime 1.24.4 for both backend and frontend services
- Node.js LTS (Alpine 3.22) - Used during frontend build process only (not at runtime)

**Package Manager:**
- Go modules - Dependency management for both backend (`backend/go.mod`) and frontend (`frontend/go.mod`)
- npm 10+ - JavaScript package management for frontend assets (`frontend/assets/package.json`)
- Lockfile: `go.sum` (present), `frontend/assets/package-lock.json` (present)

## Frameworks

**Core:**
- Echo v4.13.4 - Web framework for HTTP server routing, middleware, and graceful shutdown handling (used in both backend and frontend services)

**Testing:**
- testify v1.10.0 - Go testing assertion library (indirect dependency)

**Build/Dev:**
- Webpack 5.89.0 - Frontend bundler and dev server
- webpack-cli 5.1.4 - Webpack command-line interface
- webpack-dev-server 4.15.1 - Development server with hot module replacement
- ts-loader 9.5.1 - TypeScript loader for webpack
- PostCSS 8.4.33 - CSS transformation
- Autoprefixer 10.4.16 - CSS vendor prefix automation
- cssnano 6.0.3 - CSS minification (production only)

**Frontend Asset Processing:**
- html-webpack-plugin 5.6.0 - HTML template generation
- mini-css-extract-plugin 2.7.7 - CSS extraction to separate files
- terser-webpack-plugin 5.3.10 - JavaScript minification
- css-minimizer-webpack-plugin 5.0.1 - CSS minification
- css-loader 6.8.1 - CSS module loading
- style-loader 3.3.3 - Style injection
- postcss-loader 7.3.4 - PostCSS processing pipeline

**Type Checking:**
- TypeScript compiler v5.3.3 - Static type checking via `npm run type-check`

## Key Dependencies

**Critical:**
- github.com/labstack/echo/v4 v4.13.4 - Core HTTP framework providing routing, middleware system, and graceful shutdown capabilities for both services
- github.com/labstack/gommon v0.4.2 - Echo's logging and utilities library

**Infrastructure:**
- golang.org/x/crypto v0.38.0 - Cryptographic functions
- golang.org/x/net v0.40.0 - Network primitives and HTTP/2 support
- golang.org/x/time v0.11.0 - Time utilities for rate limiting and timeouts
- golang.org/x/sys v0.33.0 - System-level operations
- golang.org/x/text v0.25.0 - Text processing and encoding

**Utilities:**
- github.com/mattn/go-colorable v0.1.14 - Colored terminal output for logging
- github.com/mattn/go-isatty v0.0.20 - TTY detection for terminal output formatting
- github.com/valyala/bytebufferpool v1.0.0 - Byte buffer object pool for performance
- github.com/valyala/fasttemplate v1.2.2 - Fast HTML template engine

## Configuration

**Environment:**
- Backend server configuration: `backend/internal/config/config.go` - Hardcoded config (no env vars)
  - `PylonAPIBaseURL` = https://api.usepylon.com
  - `ServerPort` = :8080
- Frontend server configuration: `frontend/internal/config/config.go` - Loads from environment with fallbacks
  - `PROXY_URL` - Backend service URL (default: http://localhost:8080)
  - `SERVER_PORT` - Frontend server port (default: :8081)

**Build:**
- Frontend build: Webpack configuration at `frontend/assets/webpack.config.js`
  - Entry: `frontend/assets/src/js/main.ts`
  - Output: `frontend/assets/dist/` with content-hashed assets
  - TypeScript compilation with strict checking enabled
  - CSS extraction and minification in production
  - Asset optimization with Terser and CSSNano
  - Public path: `/`

- Backend build: Standard Go build in Dockerfile
  - CGO disabled for cross-platform compatibility
  - Build output: `bin/pylon-proxy` binary

## Platform Requirements

**Development:**
- Docker 20.10+ with Docker Compose for local development
- Node.js LTS (for npm package management)
- Go 1.24.4 (if building locally without Docker)
- Unix-like shell for `start-development.sh` script

**Production:**
- Docker/Kubernetes container platforms
- Deployment targets: Porter (primary deployment platform)
- Alpine Linux 3.22 base image for minimal container size
- Both services run as non-root user (`appuser`) for security
- Load balancer supporting health checks on `/health` and `/api/health` endpoints

**Infrastructure Features:**
- Graceful shutdown handling with configurable grace period (25 seconds)
- Health check endpoints returning 503 during shutdown for load balancer coordination
- Resource limits: 0.1 CPU and 128MB memory per service
- Restart policy: on-failure with 3 retries
- Network: Bridge network mode with port binding to 127.0.0.1

---

*Stack analysis: 2026-03-30*
