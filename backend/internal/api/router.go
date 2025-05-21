// backend/internal/api/router.go
package api

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Kurs-24-06/aegis/backend/internal/config"
	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
	"github.com/Kurs-24-06/aegis/backend/internal/simulation"
	"github.com/gorilla/mux"
)

// API response structure
type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// APIRouter defines the HTTP endpoints for the AEGIS API
type APIRouter struct {
	router *mux.Router
}

func errorMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                logging.Logger.Errorf("Panic aufgetreten: %v", err)
                response := Response{
                    Status: "error",
                    Error:  "Interner Serverfehler",
                }
                writeJSONResponse(w, http.StatusInternalServerError, response)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

// NewAPIRouter creates a new API router
func NewAPIRouter() *APIRouter {
    router := mux.NewRouter().PathPrefix("/api").Subrouter()
    api := &APIRouter{router: router}
    
    // Füge die Error-Middleware zum Router hinzu
    router.Use(errorMiddleware)

    // Health check
    router.HandleFunc("/health", api.healthHandler).Methods("GET")
    
    // Version endpoint
    router.HandleFunc("/version", api.versionHandler).Methods("GET")

    // Authentication endpoints
    router.HandleFunc("/auth/login", api.loginHandler).Methods("POST")
    router.HandleFunc("/auth/logout", api.logoutHandler).Methods("POST")
    router.HandleFunc("/auth/validate-token", api.validateTokenHandler).Methods("POST")
    
    // Infrastructure endpoints
    router.HandleFunc("/infrastructure", api.getInfrastructureHandler).Methods("GET")
    router.HandleFunc("/infrastructure", api.createInfrastructureHandler).Methods("POST")
    
    // Simulation endpoints
    router.HandleFunc("/simulations", api.getSimulationsHandler).Methods("GET")
    router.HandleFunc("/simulations/{id}", api.getSimulationHandler).Methods("GET")
    router.HandleFunc("/simulations", api.createSimulationHandler).Methods("POST")
    router.HandleFunc("/simulations/{id}/start", api.startSimulationHandler).Methods("POST")
    router.HandleFunc("/simulations/{id}/stop", api.stopSimulationHandler).Methods("POST")
    router.HandleFunc("/simulations/{id}/pause", api.pauseSimulationHandler).Methods("POST")
    
    // Monitoring endpoints
    router.HandleFunc("/monitoring/simulations/{id}/status", api.getSimulationStatusHandler).Methods("GET")
    router.HandleFunc("/monitoring/simulations/{id}/events", api.getSimulationEventsHandler).Methods("GET")
    router.HandleFunc("/monitoring/simulations/{id}/resources", api.getAffectedResourcesHandler).Methods("GET")
    
    // Initialisiere den Simulations-Service mit Beispieldaten für die Entwicklung
    if os.Getenv("ENVIRONMENT") == "development" {
        simulation.GetService().AddMockData()
    }

    return api
	}

// Handler returns the router handler
func (api *APIRouter) Handler() http.Handler {
	return api.router
}

// Health check handler
func (api *APIRouter) healthHandler(w http.ResponseWriter, r *http.Request) {
	response := Response{
		Status: "healthy",
		Data: map[string]interface{}{
			"timestamp": time.Now().Format(time.RFC3339),
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// Version handler
func (api *APIRouter) versionHandler(w http.ResponseWriter, r *http.Request) {
	response := Response{
		Status: "success",
		Data: map[string]interface{}{
			"version":       config.Version,
			"buildTime":     config.BuildTimestamp,
			"gitCommit":     config.GitCommit,
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// Infrastructure handlers (minimal implementation)
func (api *APIRouter) getInfrastructureHandler(w http.ResponseWriter, r *http.Request) {
	// Mock implementation
	response := Response{
		Status: "success",
		Data: []map[string]interface{}{
			{
				"id":          "inf-1",
				"name":        "Test Infrastructure",
				"description": "Test infrastructure for development",
				"createdAt":   time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
			},
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) createInfrastructureHandler(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var requestData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		logging.Logger.Errorf("Error parsing request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request format")
		return
	}
	
	// Mock implementation
	response := Response{
		Status:  "success",
		Message: "Infrastructure created successfully",
		Data: map[string]interface{}{
			"id":          "inf-new",
			"name":        requestData["name"],
			"description": requestData["description"],
			"createdAt":   time.Now().Format(time.RFC3339),
		},
	}
	writeJSONResponse(w, http.StatusCreated, response)
}

// Simulation handlers
func (api *APIRouter) getSimulationsHandler(w http.ResponseWriter, r *http.Request) {
	simService := simulation.GetService()
	simulations := simService.GetSimulations()
	
	response := Response{
		Status: "success",
		Data:   simulations,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) getSimulationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	simService := simulation.GetService()
	sim, err := simService.GetSimulation(id)
	if err != nil {
		writeErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	
	response := Response{
		Status: "success",
		Data:   sim,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) createSimulationHandler(w http.ResponseWriter, r *http.Request) {
	var config simulation.SimulationConfig
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		logging.Logger.Errorf("Error parsing simulation config: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request format")
		return
	}
	
	simService := simulation.GetService()
	sim, err := simService.CreateSimulation(config)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	response := Response{
		Status:  "success",
		Message: "Simulation created successfully",
		Data:    sim,
	}
	writeJSONResponse(w, http.StatusCreated, response)
}

func (api *APIRouter) startSimulationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	simService := simulation.GetService()
	sim, err := simService.StartSimulation(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	response := Response{
		Status:  "success",
		Message: "Simulation started successfully",
		Data:    sim,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) stopSimulationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	simService := simulation.GetService()
	sim, err := simService.StopSimulation(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	response := Response{
		Status:  "success",
		Message: "Simulation stopped successfully",
		Data:    sim,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) pauseSimulationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	simService := simulation.GetService()
	sim, err := simService.PauseSimulation(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	response := Response{
		Status:  "success",
		Message: "Simulation paused successfully",
		Data:    sim,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// Monitoring handlers
func (api *APIRouter) getSimulationStatusHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	simService := simulation.GetService()
	status, err := simService.GetSimulationStatus(id)
	if err != nil {
		writeErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	
	response := Response{
		Status: "success",
		Data:   status,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) getSimulationEventsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Parse limit query parameter
	limit := 20 // Default limit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}
	
	simService := simulation.GetService()
	events, err := simService.GetEvents(id)
	if err != nil {
		writeErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	
	// Limit the number of events if needed
	if len(events) > limit {
		events = events[len(events)-limit:]
	}
	
	response := Response{
		Status: "success",
		Data:   events,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) getAffectedResourcesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	simService := simulation.GetService()
	resources, err := simService.GetAffectedResources(id)
	if err != nil {
		writeErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	
	response := Response{
		Status: "success",
		Data:   resources,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// Helper functions
func writeJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		logging.Logger.Errorf("Error encoding response: %v", err)
	}
}

func writeErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	response := Response{
		Status: "error",
		Error:  message,
	}
	writeJSONResponse(w, statusCode, response)
}