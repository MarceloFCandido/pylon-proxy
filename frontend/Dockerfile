FROM node:lts-alpine3.22 AS frontend
WORKDIR /app

COPY assets .

RUN npm ci && \
    npm run build:ci

FROM golang:1.24.4-alpine3.22 AS server

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -v -o bin/pylon-proxy ./cmd/pylon-proxy/main.go

FROM alpine:3.22

WORKDIR /app

RUN mkdir dist
COPY --from=frontend /app/dist ./dist
COPY --from=server /app/bin/pylon-proxy .

RUN adduser -D appuser
USER appuser

EXPOSE 8081

ENTRYPOINT ["./pylon-proxy"]
