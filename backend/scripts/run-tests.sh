#!/bin/bash
# backend/scripts/run-tests.sh - Umfassendes Test-Script für das Backend

set -e

# Skript-Verzeichnis ermitteln
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Farben für die Ausgabe definieren
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Keine Farbe

# Zeigt einen Abschnittsheader an
function show_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Ermittle die Test-Umgebung
TEST_ENV=${TEST_ENV:-"test"}
COVERAGE_PROFILE="coverage.txt"
COVERAGE_HTML="coverage.html"

show_header "Go Tests für AEGIS Backend (Umgebung: $TEST_ENV)"

# Stelle sicher, dass die Testumgebung konfiguriert ist
if [ -f "config/config.${TEST_ENV}.yaml" ]; then
  echo -e "${YELLOW}Verwende Testkonfiguration: config/config.${TEST_ENV}.yaml${NC}"
  export ENVIRONMENT="$TEST_ENV"
else
  echo -e "${YELLOW}Warnung: Keine spezifische Testkonfiguration gefunden - verwende Standard${NC}"
  export ENVIRONMENT="dev"
fi

# Unit-Tests ausführen
show_header "Unit-Tests ausführen"

# Tests mit Race-Detection und Coverage
go test -race -coverprofile=$COVERAGE_PROFILE -covermode=atomic ./...

# Coverage-Bericht erstellen
show_header "Coverage-Bericht erstellen"
go tool cover -html=$COVERAGE_PROFILE -o=$COVERAGE_HTML

# Formatierte Coverage-Metriken anzeigen
COVERAGE_PCT=$(go tool cover -func=$COVERAGE_PROFILE | grep total | awk '{print $3}')
echo -e "Gesamt-Coverage: ${GREEN}${COVERAGE_PCT}${NC}"

# Integration-Tests ausführen, wenn --integration Flag gesetzt ist
if [[ "$*" == *"--integration"* ]]; then
  show_header "Integration Tests ausführen"
  go test -tags=integration ./tests/integration/...
fi

show_header "Test-Zusammenfassung"
echo -e "${GREEN}Alle Tests erfolgreich abgeschlossen!${NC}"
echo -e "Coverage-Bericht: ${BLUE}$ROOT_DIR/$COVERAGE_HTML${NC}"
echo -e "Coverage: ${GREEN}${COVERAGE_PCT}${NC}"