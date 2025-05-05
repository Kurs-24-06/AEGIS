# AEGIS Project Makefile
.PHONY: setup dev test build docker-build docker-push clean

# Default variables
DOCKER_REPO ?= ghcr.io/kurs-24-06/aegis
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "v0.1.0-alpha")

# Default target
all: setup

# Setup development environment
setup:
	@echo "Setting up AEGIS development environment..."
	@chmod +x setup-dev.sh
	@./setup-dev.sh

# Start development environment
dev:
	@echo "Starting AEGIS development environment..."
	@docker-compose -f docker-compose.dev.yml up --build

# Run tests
test:
	@echo "Running tests..."
	@cd backend && go test ./...
	@cd frontend && npm test

# Build the project
build:
	@echo "Building AEGIS project..."
	@cd backend && go build -o ../bin/aegis ./cmd
	@cd frontend && npm run build

# Build Docker images
docker-build:
	@echo "Building Docker images..."
	@docker build -t $(DOCKER_REPO)/aegis-backend:$(VERSION) -f backend/Dockerfile backend
	@docker build -t $(DOCKER_REPO)/aegis-frontend:$(VERSION) -f frontend/Dockerfile frontend
	@docker tag $(DOCKER_REPO)/aegis-backend:$(VERSION) $(DOCKER_REPO)/aegis-backend:latest
	@docker tag $(DOCKER_REPO)/aegis-frontend:$(VERSION) $(DOCKER_REPO)/aegis-frontend:latest

# Push Docker images
docker-push:
	@echo "Pushing Docker images..."
	@docker push $(DOCKER_REPO)/aegis-backend:$(VERSION)
	@docker push $(DOCKER_REPO)/aegis-backend:latest
	@docker push $(DOCKER_REPO)/aegis-frontend:$(VERSION)
	@docker push $(DOCKER_REPO)/aegis-frontend:latest

# Clean up
clean:
	@echo "Cleaning up..."
	@rm -rf bin
	@rm -rf frontend/dist
	@rm -rf data
	@rm -rf logs
	@docker-compose -f docker-compose.dev.yml down

# Help
help:
	@echo "AEGIS Project Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make setup     - Set up development environment"
	@echo "  make dev       - Start development environment"
	@echo "  make test      - Run tests"
	@echo "  make build     - Build the project"
	@echo "  make docker-build - Build Docker images"
	@echo "  make docker-push  - Push Docker images"
	@echo "  make clean     - Clean up"
	@echo ""
	@echo "Variables:"
	@echo "  DOCKER_REPO  - Docker repository (default: ghcr.io/kurs-24-06/aegis)"
	@echo "  VERSION      - Version tag (default: git describe or v0.1.0-alpha)"