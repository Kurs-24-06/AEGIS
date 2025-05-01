# Build stage
FROM golang:1.21-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go.mod and go.sum files
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the Go app with optimizations
ARG VERSION=unknown
RUN go build -ldflags="-s -w -X main.version=${VERSION}" -o bin/aegis ./cmd

# Runtime stage
FROM alpine:latest

# Add CA certificates for HTTPS requests
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Create non-root user for security
RUN adduser -D -g '' aegisuser
USER aegisuser

# Copy binary from build stage
COPY --from=build /app/bin/aegis .

# Copy configuration files if needed
COPY --from=build /app/config ./config

# Add version info
ARG VERSION=unknown
RUN echo $VERSION > /app/version.txt

# Expose port for the application
EXPOSE 8080

# Run the application
CMD ["./aegis"]