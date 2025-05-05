// backend/internal/api/router.go
package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Kurs-24-06/aegis/backend/internal/config"
	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
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

// NewAPIRouter creates a new API router
func NewAPIRouter() *APIRouter {
	router := mux.NewRouter().PathPrefix("/api").Subrouter()
	api := &APIRouter{router: router}

	// Health check
	router.HandleFunc("/health", api.healthHandler).Methods("GET")
	
	// Version endpoint
	router.HandleFunc("/version", api.versionHandler).Methods("GET")
	
	// Infrastructure endpoints
	router.HandleFunc("/infrastructure", api.getInfrastructureHandler).Methods("GET")
	router.HandleFunc("/infrastructure", api.createInfrastructureHandler).Methods("POST")
	
	// Simulation endpoints
	router.HandleFunc("/simulations", api.getSimulationsHandler).Methods("GET")
	router.HandleFunc("/simulations/{id}", api.getSimulationHandler).Methods("GET")
	router.HandleFunc("/simulations", api.createSimulationHandler).Methods("POST")
	router.HandleFunc("/simulations/{id}/start", api.startSimulationHandler).Methods("POST")
	router.HandleFunc("/simulations/{id}/stop", api.stopSimulationHandler).Methods("POST")
	
	// Monitoring endpoints
	router.HandleFunc("/monitoring/simulations/{id}/status", api.getSimulationStatusHandler).Methods("GET")
	router.HandleFunc("/monitoring/simulations/{id}/events", api.getSimulationEventsHandler).Methods("GET")
	router.HandleFunc("/monitoring/simulations/{id}/resources", api.getAffectedResourcesHandler).Methods("GET")

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

// Simulation handlers (minimal implementation)
func (api *APIRouter) getSimulationsHandler(w http.ResponseWriter, r *http.Request) {
	// Mock implementation
	response := Response{
		Status: "success",
		Data: []map[string]interface{}{
			{
				"id":          "sim-1",
				"name":        "Test Simulation",
				"status":      "completed",
				"startTime":   time.Now().Add(-1 * time.Hour).Format(time.RFC3339),
				"endTime":     time.Now().Add(-30 * time.Minute).Format(time.RFC3339),
			},
			{
				"id":          "sim-2",
				"name":        "Active Simulation",
				"status":      "running",
				"startTime":   time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
				"endTime":     nil,
			},
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) getSimulationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Mock implementation
	response := Response{
		Status: "success",
		Data: map[string]interface{}{
			"id":          id,
			"name":        "Test Simulation",
			"status":      "running",
			"startTime":   time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
			"endTime":     nil,
			"progress":    0.45,
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) createSimulationHandler(w http.ResponseWriter, r *http.Request) {
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
		Message: "Simulation created successfully",
		Data: map[string]interface{}{
			"id":          "sim-new",
			"name":        requestData["name"],
			"status":      "not_started",
			"createdAt":   time.Now().Format(time.RFC3339),
		},
	}
	writeJSONResponse(w, http.StatusCreated, response)
}

func (api *APIRouter) startSimulationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Mock implementation
	response := Response{
		Status:  "success",
		Message: "Simulation started successfully",
		Data: map[string]interface{}{
			"id":          id,
			"status":      "running",
			"startTime":   time.Now().Format(time.RFC3339),
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) stopSimulationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Mock implementation
	response := Response{
		Status:  "success",
		Message: "Simulation stopped successfully",
		Data: map[string]interface{}{
			"id":          id,
			"status":      "stopped",
			"endTime":     time.Now().Format(time.RFC3339),
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// Monitoring handlers (minimal implementation)
func (api *APIRouter) getSimulationStatusHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Mock implementation
	response := Response{
		Status: "success",
		Data: map[string]interface{}{
			"id":                  id,
			"status":              "running",
			"runtime":             "00:10:15",
			"threatsDetected":     3,
			"compromisedResources": 1,
			"progress":            0.45,
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) getSimulationEventsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Mock implementation
	response := Response{
		Status: "success",
		Data: []map[string]interface{}{
			{
				"id":          "event-1",
				"simulationId": id,
				"timestamp":   time.Now().Add(-9 * time.Minute).Format(time.RFC3339),
				"type":        "discovery",
				"description": "Scanning network for open ports",
				"severity":    "info",
			},
			{
				"id":          "event-2",
				"simulationId": id,
				"timestamp":   time.Now().Add(-5 * time.Minute).Format(time.RFC3339),
				"type":        "exploitation",
				"description": "Exploiting vulnerability in web server",
				"resourceId":  "resource-1",
				"severity":    "medium",
			},
			{
				"id":          "event-3",
				"simulationId": id,
				"timestamp":   time.Now().Add(-2 * time.Minute).Format(time.RFC3339),
				"type":        "lateral_movement",
				"description": "Moving to database server",
				"resourceId":  "resource-2",
				"severity":    "high",
			},
		},
	}
	writeJSONResponse(w, http.StatusOK, response)
}

func (api *APIRouter) getAffectedResourcesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Mock implementation
	response := Response{
		Status: "success",
		Data: []map[string]interface{}{
			{
				"id":          "resource-1",
				"simulationId": id,
				"name":        "Web Server",
				"type":        "server",
				"status":      "compromised",
				"threatLevel": 0.8,
				"attackVector": "CVE-2023-1234",
			},
			{
				"id":          "resource-2",
				"simulationId": id,
				"name":        "Database Server",
				"type":        "server",
				"status":      "vulnerable",
				"threatLevel": 0.4,
				"attackVector": "Weak credentials",
			},
		},
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