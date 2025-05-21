// backend/internal/api/scenario_handler.go
package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
	"github.com/Kurs-24-06/aegis/backend/internal/simulation"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// getScenariosHandler gibt alle verfügbaren Szenarien zurück
func (api *APIRouter) getScenariosHandler(w http.ResponseWriter, r *http.Request) {
	// Mock-Daten aus dem Simulationsmodul abrufen
	scenarios := simulation.GenerateMockSimulationScenarios()
	
	response := Response{
		Status: "success",
		Data:   scenarios,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// getScenarioHandler gibt ein bestimmtes Szenario zurück
func (api *APIRouter) getScenarioHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Mock-Daten abrufen
	scenarios := simulation.GenerateMockSimulationScenarios()
	
	// Suche nach dem angeforderten Szenario
	var scenario map[string]interface{}
	for _, s := range scenarios {
		if s["id"] == id {
			scenario = s
			break
		}
	}
	
	if scenario == nil {
		writeErrorResponse(w, http.StatusNotFound, "Scenario not found")
		return
	}
	
	response := Response{
		Status: "success",
		Data:   scenario,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// createScenarioHandler erstellt ein neues Szenario
func (api *APIRouter) createScenarioHandler(w http.ResponseWriter, r *http.Request) {
	var requestData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		logging.Logger.Errorf("Error parsing request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request format")
		return
	}
	
	// Generiere eine ID für das neue Szenario
	id := "scenario-" + uuid.New().String()[0:8]
	
	// Erstelle das neue Szenario mit den angegebenen Daten
	scenario := map[string]interface{}{
		"id":          id,
		"name":        requestData["name"],
		"description": requestData["description"],
		"difficulty":  requestData["difficulty"],
		"duration":    requestData["duration"],
		"steps":       requestData["steps"],
		"createdAt":   time.Now().Format(time.RFC3339),
	}
	
	response := Response{
		Status:  "success",
		Message: "Scenario created successfully",
		Data:    scenario,
	}
	writeJSONResponse(w, http.StatusCreated, response)
}