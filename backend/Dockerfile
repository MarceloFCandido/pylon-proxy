# --- Build stage ---
FROM golang:1.24.4-alpine3.22 AS builder

WORKDIR /app

# Install git for Go modules if needed
RUN apk add --no-cache git

# Copy go mod files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -v -o bin/pylon-proxy ./cmd/pylon-proxy/main.go

# --- Run stage ---
FROM alpine:3.22

WORKDIR /app

# Copy the binary from the builder
COPY --from=builder /app/bin/pylon-proxy .

# Use a non-root user for security
RUN adduser -D appuser
USER appuser

# Expose the port (Echo default)
EXPOSE 8080

# Run the binary
ENTRYPOINT ["./pylon-proxy"]
