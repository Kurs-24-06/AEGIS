// backend/cmd/main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Kurs-24-06/aegis/backend/internal/config"
)

func main() {
	// Konfiguration laden
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Fehler beim Laden der Konfiguration: %v", err)
	}

	// Konfiguration für Logging anwenden
	setupLogging(cfg.Logging.Level, cfg.Logging.Format)

	// Server-Konfiguration anwenden
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	
	// CORS-Konfiguration anwenden
	corsHandler := setupCORS(cfg.Server.CORS.AllowedOrigins, 
	                         cfg.Server.CORS.AllowedMethods, 
	                         cfg.Server.CORS.AllowedHeaders)
	
	// Weitere Konfiguration anwenden...

	// Server starten
	fmt.Printf("Server startet auf %s im %s-Modus\n", addr, getEnvironmentName())
	http.ListenAndServe(addr, corsHandler(setupRoutes()))
}

// Hilfsfunktionen für Logging, CORS, Routing usw.
// ...

// getEnvironmentName gibt den Namen der aktuellen Umgebung zurück
func getEnvironmentName() string {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		return "development"
	}
	return env
}