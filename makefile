# AEGIS Makefile (Windows CMD-kompatibel)
.PHONY: setup dev test build deploy-aws deploy-azure clean help check-prereqs docker-build docker-push tf-init dev-build prod-build package version start-dev stop-dev

# Variablen für Pfade und Einstellungen
BACKEND_DIR = ./backend
FRONTEND_DIR = ./frontend
INFRA_DIR = ./infra
ENV ?= dev
AWS_REGION ?= eu-central-1
AZURE_LOCATION ?= westeurope
VERSION := $(shell ./version.sh || git describe --tags --always --dirty || echo "0.0.0-dev")
DOCKER_REPO ?= ghcr.io/kurs-24-06/aegis

# Standardziel
default: help

help:
	@echo AEGIS Projektbefehle:
	@echo -----------------------------
	@echo   make check-prereqs   - Prüft Voraussetzungen (Go, Node, Terraform)
	@echo   make setup           - Installiert alle Abhängigkeiten
	@echo   make dev             - Startet Frontend ^& Backend im Entwicklungsmodus
	@echo   make start-dev       - Startet Docker-Entwicklungsumgebung
	@echo   make stop-dev        - Stoppt Docker-Entwicklungsumgebung
	@echo   make test            - Führt Tests aus
	@echo   make dev-build       - Baut Projekt im Entwicklungsmodus
	@echo   make prod-build      - Baut Projekt im Produktionsmodus
	@echo   make build           - Baut Projekt (Standard: Entwicklungsmodus)
	@echo   make package         - Erstellt Deployment-Paket
	@echo   make version         - Zeigt aktuelle Version
	@echo   make docker-build    - Baut Docker-Images
	@echo   make docker-push     - Pusht Docker-Images ins Repository
	@echo   make tf-init         - Initialisiert Terraform für beide Cloud-Provider
	@echo   make deploy-aws      - Deployt auf AWS (ENV=dev|staging|prod)
	@echo   make deploy-azure    - Deployt auf Azure (ENV=dev|staging|prod)
	@echo   make clean           - Bereinigt temporäre Dateien
	@echo -----------------------------
	@echo Beispiel: make deploy-aws ENV=dev

check-prereqs:
	@echo Prüfe Voraussetzungen...
	@go version || (echo "Go ist nicht installiert" && exit 1)
	@node -v || (echo "Node.js ist nicht installiert" && exit 1)
	@terraform -v || (echo "Terraform ist nicht installiert" && exit 1)
	@docker -v || (echo "Docker ist nicht installiert" && exit 1)

setup: check-prereqs
	@echo Installiere Frontend-Abhängigkeiten...
	cd $(FRONTEND_DIR) && npm install
	@echo Installiere Backend-Abhängigkeiten...
	cd $(BACKEND_DIR) && go mod download
	@echo Setup abgeschlossen.

dev-setup: check-prereqs
	@echo Prüfe Umgebungsanforderungen...
	@node -v | grep "v20" || (echo "Node.js v20.x erforderlich" && exit 1)
	@go version | grep "go1.21" || (echo "Go 1.21 erforderlich" && exit 1)
	@make setup

dev: setup
	@echo Starte Frontend und Backend...
	cd $(FRONTEND_DIR) && npm start & cd $(BACKEND_DIR) && go run cmd/main.go

start-dev:
	@docker-compose up -d
	@echo "Entwicklungsumgebung läuft unter:"
	@echo "- Frontend: http://localhost:4200"
	@echo "- Backend: http://localhost:8080"
	@echo "- Grafana: http://localhost:3000"
	@echo "- Prometheus: http://localhost:9090"
	@echo "- MinIO: http://localhost:9001"

stop-dev:
	@docker-compose down
	@echo "Entwicklungsumgebung wurde angehalten."

test: setup
	@echo Führe Frontend-Tests aus...
	cd $(FRONTEND_DIR) && npm test
	@if [ $$? -ne 0 ]; then echo "Frontend Tests fehlgeschlagen"; exit 1; fi
	@echo Führe Backend-Tests aus...
	cd $(BACKEND_DIR) && go test ./...
	@if [ $$? -ne 0 ]; then echo "Backend Tests fehlgeschlagen"; exit 1; fi
	@echo Alle Tests erfolgreich.

# Entwicklungs-Build für das Frontend
dev-build-frontend:
	@echo "Baue Frontend im Entwicklungsmodus..."
	cd $(FRONTEND_DIR) && npm run build -- --configuration=development

# Entwicklungs-Build für das Backend
dev-build-backend:
	@echo "Baue Backend im Entwicklungsmodus..."
	cd $(BACKEND_DIR) && go build -race -o bin/aegis-dev ./cmd

# Kombinierter Entwicklungs-Build
dev-build: dev-setup dev-build-frontend dev-build-backend
	@echo "Entwicklungs-Build erfolgreich abgeschlossen."
	@mkdir -p dist
	@cp -r $(FRONTEND_DIR)/dist dist/frontend
	@mkdir -p dist/bin
	@cp $(BACKEND_DIR)/bin/aegis-dev dist/bin/
	@echo "$(VERSION)-dev" > dist/version.txt

# Produktions-Frontend-Build mit Optimierung
prod-build-frontend:
	@echo "Baue Frontend für die Produktion..."
	cd $(FRONTEND_DIR) && npm run build -- --configuration=production

# Produktions-Backend-Build mit Optimierungen
prod-build-backend:
	@echo "Baue Backend für die Produktion..."
	cd $(BACKEND_DIR) && go build -ldflags="-s -w -X main.version=$(VERSION)" -o bin/aegis ./cmd

# Kombinierter Produktions-Build
prod-build: setup test prod-build-frontend prod-build-backend
	@echo "Produktions-Build erfolgreich abgeschlossen."
	@mkdir -p dist
	@cp -r $(FRONTEND_DIR)/dist dist/frontend
	@mkdir -p dist/bin
	@cp $(BACKEND_DIR)/bin/aegis dist/bin/
	@echo "$(VERSION)" > dist/version.txt

# Standard build (Entwicklung als Standard)
build: dev-build
	@echo "Standard-Build abgeschlossen. Nutze 'make prod-build' für Produktions-Build."

# Anwendung für die Bereitstellung paketieren
package: prod-build
	@echo "Erstelle Bereitstellungspaket..."
	@mkdir -p dist
	@cp -r $(FRONTEND_DIR)/dist dist/frontend
	@mkdir -p dist/bin
	@cp $(BACKEND_DIR)/bin/aegis dist/bin/
	@cp -r infra dist/infra
	@tar -czf aegis-$(VERSION).tar.gz dist
	@echo "Paket erstellt: aegis-$(VERSION).tar.gz"

# Die Version anzeigen
version:
	@echo "Aktuelle Version: $(VERSION)"

# Optimierte Docker-Images bauen
docker-build: setup
	@echo "Baue optimierte Docker-Images..."
	@echo "VERSION: $(VERSION)"
	
	# Frontend-Build
	docker build -t $(DOCKER_REPO)/aegis-frontend:$(VERSION) \
		--build-arg NODE_ENV=production \
		--build-arg VERSION=$(VERSION) \
		-f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR)
	
	# Backend-Build
	docker build -t $(DOCKER_REPO)/aegis-backend:$(VERSION) \
		--build-arg VERSION=$(VERSION) \
		-f $(BACKEND_DIR)/Dockerfile $(BACKEND_DIR)
	
	# Tag latest
	docker tag $(DOCKER_REPO)/aegis-frontend:$(VERSION) $(DOCKER_REPO)/aegis-frontend:latest
	docker tag $(DOCKER_REPO)/aegis-backend:$(VERSION) $(DOCKER_REPO)/aegis-backend:latest
	
	@echo "Docker-Images erfolgreich gebaut."

docker-push: docker-build
	@echo Pushe Docker-Images...
	docker push $(DOCKER_REPO)/aegis-frontend:$(VERSION)
	docker push $(DOCKER_REPO)/aegis-frontend:latest
	docker push $(DOCKER_REPO)/aegis-backend:$(VERSION)
	docker push $(DOCKER_REPO)/aegis-backend:latest
	@echo Docker-Images gepusht.

tf-init:
	@echo Initialisiere Terraform für AWS...
	cd $(INFRA_DIR)/aws && terraform init
	@echo Initialisiere Terraform für Azure...
	cd $(INFRA_DIR)/azure && terraform init
	@echo Terraform initialisiert.

deploy-aws: tf-init
	@echo Deploye auf AWS (Umgebung: $(ENV))...
	cd $(INFRA_DIR)/aws && terraform workspace select $(ENV) 2>/dev/null || terraform workspace new $(ENV)
	cd $(INFRA_DIR)/aws && terraform apply -auto-approve \
		-var="environment=$(ENV)" \
		-var="region=$(AWS_REGION)" \
		-var="version=$(VERSION)"
	@echo AWS-Deployment abgeschlossen.

deploy-azure: tf-init
	@echo Deploye auf Azure (Umgebung: $(ENV))...
	cd $(INFRA_DIR)/azure && terraform workspace select $(ENV) 2>/dev/null || terraform workspace new $(ENV)
	cd $(INFRA_DIR)/azure && terraform apply -auto-approve \
		-var="environment=$(ENV)" \
		-var="location=$(AZURE_LOCATION)" \
		-var="version=$(VERSION)"
	@echo Azure-Deployment abgeschlossen.

clean:
	@echo Bereinige Frontend/node_modules...
	@rm -rf $(FRONTEND_DIR)/node_modules || true
	@echo Bereinige Frontend/dist...
	@rm -rf $(FRONTEND_DIR)/dist || true
	@echo Bereinige Backend/bin...
	@rm -rf $(BACKEND_DIR)/bin || true
	@echo Bereinige dist...
	@rm -rf dist || true
	@echo Bereinige Docker-Images...
	@docker images | grep $(DOCKER_REPO)/aegis | awk '{print $$3}' | xargs -r docker rmi -f || true
	@echo Aufräumen abgeschlossen.