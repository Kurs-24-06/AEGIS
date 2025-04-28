# AEGIS Makefile (Windows-optimiert)
.PHONY: setup dev test deploy-aws deploy-azure clean

# Variablen für Pfade (anpassen falls nötig)
BACKEND_DIR = C:\Users\User\AEGIS\backend
FRONTEND_DIR = C:\Users\User\AEGIS\frontend

# Standardziel (wird ausgeführt bei 'make' ohne Argumente)
default: help

help:
	@echo "Verfügbare Befehle:"
	@echo "  make setup       - Installiert alle Abhängigkeiten"
	@echo "  make dev         - Startet Frontend & Backend im Entwicklungsmodus"
	@echo "  make test        - Führt Tests aus"
	@echo "  make deploy-aws  - Deployt auf AWS (benötigt Terraform)"
	@echo "  make deploy-azure - Deployt auf Azure (benötigt Terraform)"
	@echo "  make clean       - Bereinigt temporäre Dateien"

setup:
	@echo "Installiere Backend-Abhängigkeiten..."
	cd $(BACKEND_DIR) && go mod download
	@echo "Installiere Frontend-Abhängigkeiten..."
	cd $(FRONTEND_DIR) && npm install

dev:
	@echo "Starte Frontend (http://localhost:4200)..."
	start cmd /k "cd $(FRONTEND_DIR) && ng serve"
	@echo "Starte Backend..."
	cd $(BACKEND_DIR) && go run cmd/main.go

test:
	@echo "Führe Backend-Tests aus..."
	cd $(BACKEND_DIR) && go test ./...
	@echo "Führe Frontend-Tests aus..."
	cd $(FRONTEND_DIR) && ng test

deploy-aws:
	@echo "Deploye auf AWS..."
	cd infra/terraform/aws && terraform init && terraform apply -auto-approve

deploy-azure:
	@echo "Deploye auf Azure..."
	cd infra/terraform/azure && terraform init && terraform apply -auto-approve

clean:
	@echo "Bereinige Frontend/node_modules..."
	rmdir /s /q "$(FRONTEND_DIR)\node_modules"
	@echo "Bereinige Backend/bin..."
	cd $(BACKEND_DIR) && if exist bin rmdir /s /q bin