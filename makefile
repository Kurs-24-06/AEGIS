# AEGIS Makefile (Windows CMD-kompatibel)
.PHONY: setup dev test build deploy-aws deploy-azure clean help check-prereqs docker-build docker-push tf-init

# Variablen für Pfade und Einstellungen
BACKEND_DIR = ./backend
FRONTEND_DIR = ./frontend
INFRA_DIR = ./infra
ENV ?= dev
AWS_REGION ?= eu-central-1
AZURE_LOCATION ?= westeurope
VERSION := $(shell git describe --tags --always --dirty)
DOCKER_REPO ?= your-docker-repo

# Standardziel
default: help

help:
	@echo AEGIS Projektbefehle:
	@echo -----------------------------
	@echo   make check-prereqs - Prüft Voraussetzungen (Go, Node, Terraform)
	@echo   make setup       - Installiert alle Abhängigkeiten
	@echo   make dev         - Startet Frontend ^& Backend im Entwicklungsmodus
	@echo   make test        - Führt Tests aus
	@echo   make build       - Erstellt Build-Artefakte
	@echo   make docker-build - Baut Docker-Images
	@echo   make docker-push  - Pusht Docker-Images ins Repository
	@echo   make tf-init     - Initialisiert Terraform für beide Cloud-Provider
	@echo   make deploy-aws  - Deployt auf AWS (ENV=dev|staging|prod)
	@echo   make deploy-azure - Deployt auf Azure (ENV=dev|staging|prod)
	@echo   make clean       - Bereinigt temporäre Dateien
	@echo -----------------------------
	@echo Beispiel: make deploy-aws ENV=dev

check-prereqs:
	@echo Prüfe Voraussetzungen...
	@go version || (echo "Go ist nicht installiert" && exit 1)
	@node -v || (echo "Node.js ist nicht installiert" && exit 1)
	@terraform -v || (echo "Terraform ist nicht installiert" && exit 1)

setup: check-prereqs
	@echo Installiere Frontend-Abhängigkeiten...
	cd $(FRONTEND_DIR) && npm install
	@echo Installiere Backend-Abhängigkeiten...
	cd $(BACKEND_DIR) && go mod download
	@echo Setup abgeschlossen.

dev: setup
	@echo Starte Frontend und Backend...
	cd $(FRONTEND_DIR) && npm start & cd $(BACKEND_DIR) && go run cmd/main.go

test: setup
	@echo Führe Frontend-Tests aus...
	cd $(FRONTEND_DIR) && npm test
	@if [ $$? -ne 0 ]; then echo "Frontend Tests fehlgeschlagen"; exit 1; fi
	@echo Führe Backend-Tests aus...
	cd $(BACKEND_DIR) && go test ./...
	@if [ $$? -ne 0 ]; then echo "Backend Tests fehlgeschlagen"; exit 1; fi
	@echo Alle Tests erfolgreich.

build: test
	@echo Baue Frontend...
	cd $(FRONTEND_DIR) && npm run build
	@echo Baue Backend...
	cd $(BACKEND_DIR) && go build -o bin/aegis ./cmd
	@echo Build abgeschlossen. Version: $(VERSION)

docker-build: build
	@echo Baue Docker-Images...
	docker build -t $(DOCKER_REPO)/aegis-frontend:$(VERSION) $(FRONTEND_DIR)
	docker build -t $(DOCKER_REPO)/aegis-backend:$(VERSION) $(BACKEND_DIR)
	docker tag $(DOCKER_REPO)/aegis-frontend:$(VERSION) $(DOCKER_REPO)/aegis-frontend:latest
	docker tag $(DOCKER_REPO)/aegis-backend:$(VERSION) $(DOCKER_REPO)/aegis-backend:latest
	@echo Docker-Images gebaut.

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
	@cmd /c "if exist $(FRONTEND_DIR)\\\\node_modules rmdir /s /q $(FRONTEND_DIR)\\\\node_modules"
	@echo Bereinige Frontend/dist...
	@cmd /c "if exist $(FRONTEND_DIR)\\\\dist rmdir /s /q $(FRONTEND_DIR)\\\\dist"
	@echo Bereinige Backend/bin...
	@cmd /c "if exist $(BACKEND_DIR)\\\\bin rmdir /s /q $(BACKEND_DIR)\\\\bin"
	@echo Bereinige Docker-Images...
	@docker images | grep $(DOCKER_REPO)/aegis | awk '{print $$3}' | xargs -r docker rmi -f
	@echo Aufräumen abgeschlossen.