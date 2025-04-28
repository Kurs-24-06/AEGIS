# AEGIS Makefile (Windows CMD-kompatibel)
.PHONY: setup dev test deploy-aws deploy-azure clean

# Variablen für Pfade
BACKEND_DIR = C:/Users/User/AEGIS/backend
FRONTEND_DIR = C:/Users/User/AEGIS/frontend

# Standardziel
default: help

help:
	@echo Verfügbare Befehle:
	@echo   make setup       - Installiert alle Abhängigkeiten
	@echo   make dev         - Startet Frontend ^& Backend im Entwicklungsmodus
	@echo   make test        - Führt Tests aus
	@echo   make deploy-aws  - Deployt auf AWS (benötigt Terraform)
	@echo   make deploy-azure - Deployt auf Azure (benötigt Terraform)
	@echo   make clean       - Bereinigt temporäre Dateien

setup:
	@echo Installiere Backend-Abhängigkeiten...
	@cmd /c "if not exist \"$(BACKEND_DIR)\\go.mod\" (cd $(BACKEND_DIR) && go mod init github.com/Kurs-24-06/aegis)"
	cd $(BACKEND_DIR) && go mod download
	@echo Installiere Frontend-Abhängigkeiten...
	@cmd /c "if not exist $(FRONTEND_DIR)\package.json (echo Frontend-Projekt nicht gefunden. Bitte führen Sie 'npm init' im Frontend-Verzeichnis aus.) else (cd $(FRONTEND_DIR) && npm install)"

dev:
	@echo Starte Frontend (http://localhost:4200)...
	@cmd /c "if exist $(FRONTEND_DIR)\package.json (start cmd /k "cd $(FRONTEND_DIR) && ng serve") else (echo Frontend-Projekt nicht gefunden.)"
	@echo Starte Backend...
	cd $(BACKEND_DIR) && go run cmd/main.go

test:
	@echo Führe Backend-Tests aus...
	cd $(BACKEND_DIR) && go test ./...
	@echo Führe Frontend-Tests aus...
	@cmd /c "if exist $(FRONTEND_DIR)\package.json (cd $(FRONTEND_DIR) && ng test) else (echo Frontend-Projekt nicht gefunden.)"

deploy-aws:
	@echo Deploye auf AWS...
	cd infra/terraform/aws && terraform init && terraform apply -auto-approve

deploy-azure:
	@echo Deploye auf Azure...
	cd infra/terraform/azure && terraform init && terraform apply -auto-approve

clean:
	@echo Bereinige Frontend/node_modules...
	@cmd /c "if exist $(FRONTEND_DIR)\node_modules rmdir /s /q $(FRONTEND_DIR)\node_modules"
	@echo Bereinige Backend/bin...
	@cmd /c "if exist $(BACKEND_DIR)\bin rmdir /s /q $(BACKEND_DIR)\bin"