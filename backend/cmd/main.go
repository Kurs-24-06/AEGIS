// backend/cmd/main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Kurs-24-06/aegis/backend/internal/config"
	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
	"github.com/Kurs-24-06/aegis/backend/internal/observability/metrics"
	"github.com/Kurs-24-06/aegis/backend/internal/observability/tracing"
	"github.com/rs/cors"
)

// Version information (set during build)
var (
	version = "development"
)

func main() {
	// Konfiguration laden
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Fehler beim Laden der Konfiguration: %v", err)
	}

	// Konfiguration für Logging anwenden
	setupLogging(cfg.Logging.Level, cfg.Logging.Format)

	// Initialize tracing
	tracer, closer, err := tracing.InitTracer("aegis-backend")
	if err != nil {
		logging.Logger.Warnf("Konnte Tracer nicht initialisieren: %v", err)
	} else {
		defer closer.Close()
	}

	// Server-Konfiguration anwenden
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	
	// CORS-Konfiguration anwenden
	corsHandler := setupCORS(cfg.Server.CORS.AllowedOrigins, 
	                        cfg.Server.CORS.AllowedMethods, 
	                        cfg.Server.CORS.AllowedHeaders)

	// Set up metrics
	metricsHandler := metrics.MetricsHandler()
	metrics.SetVersion(version)
	
	// Set up routes
	router := setupRoutes()
	
	// Add metrics endpoint
	router.Handle("/metrics", metricsHandler)

	// Server starten
	logging.Logger.Infof("Server startet auf %s im %s-Modus", addr, getEnvironmentName())
	logging.Logger.Infof("Version: %s", version)
	
	if err := http.ListenAndServe(addr, corsHandler(router)); err != nil {
		logging.Logger.Fatalf("Fehler beim Starten des Servers: %v", err)
	}
}

// setupLogging konfiguriert den Logger
func setupLogging(level, format string) {
	logging.InitLogger(level, format)
	logging.Logger.Info("Logging initialisiert")
}

// setupCORS konfiguriert CORS
func setupCORS(allowedOrigins, allowedMethods, allowedHeaders []string) func(http.Handler) http.Handler {
	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   allowedMethods,
		AllowedHeaders:   allowedHeaders,
		AllowCredentials: true,
		Debug:            getEnvironmentName() == "development",
	})
	
	return c.Handler
}

// setupRoutes konfiguriert die Routen
func setupRoutes() *http.ServeMux {
	mux := http.NewServeMux()
	
	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})
	
	// Version endpoint
	mux.HandleFunc("/version", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"version":"%s"}`, version)))
	})

	// API endpoints would be added here
	
	return mux
}

// getEnvironmentName gibt den Namen der aktuellen Umgebung zurück
func getEnvironmentName() string {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		return "development"
	}
	return strings.ToLower(env)
}