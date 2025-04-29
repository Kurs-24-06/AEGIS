# AEGIS Makefile (Windows CMD-kompatibel)
.PHONY: setup dev test build deploy-aws deploy-azure clean

# Variablen für Pfade
BACKEND_DIR = ./backend
FRONTEND_DIR = ./frontend

# Standardziel
default: help

help:
	@echo Verfügbare Befehle:
	@echo   make setup       - Installiert alle Abhängigkeiten
	@echo   make dev         - Startet Frontend ^& Backend im Entwicklungsmodus
	@echo   make test        - Führt Tests aus
	@echo   make build       - Erstellt Build-Artefakte
	@echo   make deploy-aws  - Deployt auf AWS (benötigt Terraform)
	@echo   make deploy-azure - Deployt auf Azure (benötigt Terraform)
	@echo   make clean       - Bereinigt temporäre Dateien

setup:
	@echo Installiere Frontend-Abhängigkeiten...
	cd $(FRONTEND_DIR) && npm install
	@echo Installiere Backend-Abhängigkeiten...
	cd $(BACKEND_DIR) && go mod download

dev:
	@echo Starte Frontend und Backend...
	cd $(FRONTEND_DIR) && npm start & cd $(BACKEND_DIR) && go run cmd/main.go

test:
	@echo Führe Frontend-Tests aus...
	cd $(FRONTEND_DIR) && npm test
	@echo Führe Backend-Tests aus...
	cd $(BACKEND_DIR) && go test ./...

build:
	@echo Baue Frontend...
	cd $(FRONTEND_DIR) && npm run build
	@echo Baue Backend...
	cd $(BACKEND_DIR) && go build -o bin/aegis ./cmd

deploy-aws:
	@echo Deploye auf AWS...
	cd infra/aws && terraform init && terraform apply -auto-approve

deploy-azure:
	@echo Deploye auf Azure...
	cd infra/azure && terraform init && terraform apply -auto-approve

clean:
	@echo Bereinige Frontend/node_modules...
	@cmd /c "if exist $(FRONTEND_DIR)\\\\node_modules rmdir /s /q $(FRONTEND_DIR)\\\\node_modules"
	@echo Bereinige Backend/bin...
	@cmd /c "if exist $(BACKEND_DIR)\\\\bin rmdir /s /q $(BACKEND_DIR)\\\\bin"