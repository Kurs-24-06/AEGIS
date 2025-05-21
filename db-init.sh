#!/bin/bash
# db-init.sh - Verbesserte Version mit besserer Fehlerbehandlung

set -e

# Farben für Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # Keine Farbe

# Hilfsfunktion für Fehlerbehandlung
function error_exit {
    echo -e "${RED}Fehler: ${1}${NC}" 1>&2
    exit 1
}

# Hilfsfunktion für Informationsnachrichten
function info {
    echo -e "${GREEN}${1}${NC}"
}

# Hilfsfunktion für Warnungen
function warning {
    echo -e "${YELLOW}${1}${NC}"
}

# Überprüfe, ob die notwendigen Variablen gesetzt sind
ENVIRONMENT=${ENVIRONMENT:-development}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-aegisuser}
DB_PASSWORD=${DB_PASSWORD:-dev-password}
DB_NAME=${DB_NAME:-aegis_dev}

# Log-Datei
LOG_FILE="db-init.log"

info "===================================="
info "  AEGIS Database Initialization     "
info "===================================="

info "\nDatenbank-Konfiguration:"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Host: ${DB_HOST}"
echo -e "Port: ${DB_PORT}"
echo -e "User: ${DB_USER}"
echo -e "Database: ${DB_NAME}"

# Prüfe, ob psql verfügbar ist
if ! command -v psql &> /dev/null; then
    warning "PostgreSQL-Client (psql) ist nicht installiert."
    warning "Verwende Docker stattdessen..."
    
    # Verwende PostgreSQL in Docker
    info "\nPrüfe, ob PostgreSQL-Container läuft..."
    if [ "$(docker ps -q -f name=postgres)" ]; then
        info "PostgreSQL-Container läuft."
    else
        error_exit "PostgreSQL-Container läuft nicht. Bitte starte zuerst die Entwicklungsumgebung mit ./dev.sh"
    fi
    
    info "\nFühre Migrationen im PostgreSQL-Container aus..."
    
    # Prüfe, ob Migrations-Verzeichnis existiert
    if [ ! -d "backend/db/migrations" ]; then
        warning "Migrations-Verzeichnis existiert nicht."
        warning "Erstelle Migrations-Verzeichnis..."
        mkdir -p backend/db/migrations
        
        # Erstelle Beispiel-Migration
        cat > backend/db/migrations/001_initial_schema.sql << 'EOF'
-- Create initial AEGIS database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rest der Schema-Definition...
EOF
        info "Initial-Migrations-Skript erstellt."
    fi
    
    # Führe jede Migrationsdatei der Reihe nach aus
    for migration in $(ls -v backend/db/migrations/*.sql); do
        filename=$(basename $migration)
        warning "Führe Migration aus: ${filename}"
        docker exec -i $(docker ps -q -f name=postgres) psql -U ${DB_USER} -d ${DB_NAME} < $migration || error_exit "Migration fehlgeschlagen: ${filename}"
    done
    
    info "\nDatenbank-Migration erfolgreich abgeschlossen!"
    exit 0
fi

# Rest des Skripts für direkte psql-Verwendung...