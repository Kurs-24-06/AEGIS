#!/bin/bash
# AEGIS Backend Fehlerbehebung

echo "🔧 AEGIS Backend Fehlerbehebung"
echo "==============================="
echo ""

# Ins Backend-Verzeichnis wechseln
if [ ! -d "backend" ]; then
    echo "❌ Backend-Verzeichnis nicht gefunden!"
    echo "Du musst dieses Script im AEGIS Hauptverzeichnis ausführen."
    exit 1
fi

cd backend
echo "📂 Wechsle ins Backend-Verzeichnis..."

# Problem 1: go.mod fehlt
echo ""
echo "🔍 Prüfe Go-Module..."
if [ ! -f "go.mod" ]; then
    echo "⚠️  go.mod fehlt - erstelle es..."
    go mod init github.com/Kurs-24-06/aegis/backend
    echo "✅ go.mod erstellt"
else
    echo "✅ go.mod vorhanden"
fi

# Problem 2: Dependencies fehlen
echo ""
echo "📦 Installiere Dependencies..."
go mod tidy
echo "✅ Dependencies installiert"

# Problem 3: Konfiguration fehlt
echo ""
echo "⚙️  Prüfe Konfiguration..."
if [ ! -d "config" ]; then
    mkdir -p config
    echo "📁 config Verzeichnis erstellt"
fi

if [ ! -f "config/config.dev.yaml" ]; then
    echo "⚠️  Development-Konfiguration fehlt - erstelle sie..."
    cat > config/config.dev.yaml << 'EOF'
server:
  port: 8080
  debug: true
  cors:
    allowed_origins: ["http://localhost:4200"]
    allowed_methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: ["Authorization", "Content-Type"]

database:
  type: "postgres"
  host: "localhost"
  port: 5432
  user: "aegisuser"
  password: "dev-password"
  name: "aegis_dev"
  sslMode: "disable"

redis:
  host: "localhost"
  port: 6379
  password: ""

simulation:
  worker_count: 2
  buffer_size: 1000
  default_timeout_seconds: 300

logging:
  level: "debug"
  format: "text"

auth:
  enabled: true
  jwt_secret: "dev-jwt-secret-change-me"
  token_expiry: "24h"
EOF
    echo "✅ config/config.dev.yaml erstellt"
else
    echo "✅ Konfiguration vorhanden"
fi

# Problem 4: cmd/main.go fehlt oder fehlerhaft
echo ""
echo "🔍 Prüfe main.go..."
if [ ! -f "cmd/main.go" ]; then
    echo "⚠️  cmd/main.go fehlt - erstelle es..."
    mkdir -p cmd
    cat > cmd/main.go << 'EOF'
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Kurs-24-06/aegis/backend/internal/api"
	"github.com/Kurs-24-06/aegis/backend/internal/config"
	"github.com/rs/cors"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading configuration: %v", err)
	}

	// Server configuration
	addr := fmt.Sprintf(":%d", cfg.Server.Port)

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.Server.CORS.AllowedOrigins,
		AllowedMethods:   cfg.Server.CORS.AllowedMethods,
		AllowedHeaders:   cfg.Server.CORS.AllowedHeaders,
		AllowCredentials: true,
		Debug:            true,
	})

	// Initialize API router
	apiRouter := api.NewAPIRouter()

	// Set up main router
	router := http.NewServeMux()

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	// API router
	router.Handle("/api/", http.StripPrefix("/api", apiRouter.Handler()))

	// Start server
	fmt.Printf("Server starting on %s\n", addr)
	fmt.Println("Health check: http://localhost:8080/health")
	fmt.Println("API endpoint: http://localhost:8080/api/")

	if err := http.ListenAndServe(addr, c.Handler(router)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
EOF
    echo "✅ cmd/main.go erstellt"
else
    echo "✅ cmd/main.go vorhanden"
fi

# Problem 5: Build-Test
echo ""
echo "🔨 Test-Build durchführen..."
if go build -o test-backend ./cmd; then
    echo "✅ Build erfolgreich"
    rm -f test-backend
    
    echo ""
    echo "🚀 Starte Backend..."
    echo "Backend wird auf http://localhost:8080 gestartet"
    echo "Drücke Ctrl+C zum Stoppen"
    echo ""
    
    # Umgebungsvariablen setzen
    export ENVIRONMENT=development
    
    # Backend starten
    go run cmd/main.go
else
    echo "❌ Build fehlgeschlagen!"
    echo ""
    echo "Fehlerbehebung:"
    echo "1. Prüfe, ob Go installiert ist: go version"
    echo "2. Prüfe die Fehlermeldung oben"
    echo "3. Stelle sicher, dass alle Dependencies verfügbar sind"
fi