// backend/cmd/main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Kurs-24-06/aegis/backend/internal/api"
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
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading configuration: %v", err)
	}

	// Configure logging
	logging.InitLogger(cfg.Logging.Level, cfg.Logging.Format)
	logging.Logger.Info("Logging initialized")

	// Initialize tracing
	_, closer, err := tracing.InitTracer("aegis-backend")
	if err != nil {
		logging.Logger.Warnf("Could not initialize tracer: %v", err)
	} else {
		defer func() {
			if err := closer.Close(); err != nil {
				logging.Logger.Errorf("Error closing tracer: %v", err)
			}
		}()
	}

	// Server configuration
	addr := fmt.Sprintf(":%d", cfg.Server.Port)

	// CORS configuration
	corsHandler := setupCORS(cfg.Server.CORS.AllowedOrigins,
		cfg.Server.CORS.AllowedMethods,
		cfg.Server.CORS.AllowedHeaders)

	// Set up metrics
	metricsHandler := metrics.MetricsHandler()
	metrics.SetVersion(version)

	// Initialize API router
	apiRouter := api.NewAPIRouter()

	// Set up main router - HIER WAR DAS PROBLEM!
	mainRouter := http.NewServeMux()

	// Health check endpoint (außerhalb der API)
	mainRouter.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	// Version endpoint (außerhalb der API)
	mainRouter.HandleFunc("/version", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"version":"%s"}`, version)))
	})

	// Metrics endpoint
	mainRouter.Handle("/metrics", metricsHandler)

	// API router - KORRIGIERT: Verwende Handle statt HandleFunc
	mainRouter.Handle("/api/", apiRouter.Handler())

	// Start server
	logging.Logger.Infof("Server starting on %s in %s mode", addr, getEnvironmentName())
	logging.Logger.Infof("Version: %s", version)

	if err := http.ListenAndServe(addr, corsHandler(mainRouter)); err != nil {
		logging.Logger.Fatalf("Error starting server: %v", err)
	}
}

// setupCORS configures CORS
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

// getEnvironmentName returns the name of the current environment
func getEnvironmentName() string {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		return "development"
	}
	return strings.ToLower(env)
}