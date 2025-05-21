// backend/internal/api/simulation_handler.go
package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
	"github.com/Kurs-24-06/aegis/backend/internal/simulation"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// getSimulationsHandler gibt alle Simulationen zurück
// getSimulationHandler gibt eine bestimmte Simulation zurück
// (implementation is in router.go)

// createSimulationHandler erstellt eine neue Simulation
func (api *APIRouter) createSimulationHandler(w http.ResponseWriter, r *http.Request) {
	var requestData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		logging.Logger.Errorf("Error parsing simulation request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request format")
		return
	}
	
	// Generiere eine ID für die neue Simulation
	id := "sim-" + uuid.New().String()[0:8]
	now := time.Now()
	
	// Erstelle die neue Simulation
	simulation := map[string]interface{}{
		"id":              id,
		"name":            requestData["name"],
		"description":     requestData["description"],
		"infrastructureId": requestData["infrastructureId"],
		"scenarioId":      requestData["scenarioId"],
		"status":          "not_started",
		"startTime":       nil,
		"endTime":         nil,
		"progress":        0,
		"threatsDetected": 0,
		"createdAt":       now.Format(time.RFC3339),
		"updatedAt":       now.Format(time.RFC3339),
		"message":         "Simulation started successfully",
	}
	
	response := Response{
		Status:  "success",
		Message: "Simulation started successfully",
		Data:    simulation,
	}
	writeJSONResponse(w, http.StatusOK, response)
}


func (api *APIRouter) getSimulationStatusHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Erstelle beispielhafte Statusdaten
	// Diese würden in einer realen Implementierung aus der Datenbank oder dem Simulationsprozess kommen
	
	// Berechne eine simulierte Laufzeit
	startTime := time.Now().Add(-45 * time.Minute)
	endTime := time.Time{}
	duration := time.Since(startTime)
	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60
	seconds := int(duration.Seconds()) % 60
	runtime := fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
	
	// Berechne simulierten Fortschritt basierend auf der ID
	idNumber, err := strconv.Atoi(id[len(id)-1:])
	progress := 45
	if err == nil {
		progress = (idNumber * 10) % 100
		if progress < 5 {
			progress = 45
		}
	}
	
	// Status basierend auf Fortschritt
	status := "running"
	if progress >= 100 {
		status = "completed"
		endTime = time.Now().Add(-5 * time.Minute)
	} else if progress == 0 {
		status = "not_started"
		startTime = time.Time{}
	}
	
	// Bedrohungen basierend auf Fortschritt

	// Hier könnten weitere Statusdaten ergänzt werden
	statusData := map[string]interface{}{
		"id":              id,
		"status":          status,
		"progress":        progress,
		"runtime":         runtime,
		"startTime":       startTime.Format(time.RFC3339),
		"endTime":         func() interface{} {
			if !endTime.IsZero() {
				return endTime.Format(time.RFC3339)
			}
			return nil
		}(),
		"threatsDetected": progress / 10,
	}

	response := Response{
		Status: "success",
		Data:   statusData,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// getSimulationEventsHandler gibt die Ereignisse einer Simulation zurück
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
	
	// Erzeuge fiktive Ereignisse für die Simulation
	// In einer realen Implementierung würden diese aus der Datenbank abgerufen
	
	// Bestimme Simulationsparameter basierend auf der ID
	var scenarioID string
	idNumber, err := strconv.Atoi(id[len(id)-1:])
	if err == nil && idNumber%3 == 0 {
		scenarioID = "scenario-2" // Ransomware-Szenario
	} else if err == nil && idNumber%2 == 0 {
		scenarioID = "scenario-3" // Compliance-Szenario
	} else {
		scenarioID = "scenario-1" // Penetrationstest-Szenario
	}
	
	// Bestimme Simulationsparameter basierend auf der ID
	var scenarioID string
	idNumber, err := strconv.Atoi(id[len(id)-1:])
	if err == nil && idNumber%3 == 0 {
		scenarioID = "scenario-2" // Ransomware-Szenario
	} else if err == nil && idNumber%2 == 0 {
		scenarioID = "scenario-3" // Compliance-Szenario
	} else {
		scenarioID = "scenario-1" // Penetrationstest-Szenario
	}
	
	// Startzeit der Simulation
	startTime := time.Now().Add(-3 * time.Hour)
	
	// Generiere Simulationsergebnisse
	results := simulation.GenerateMockSimulationResults(id, scenarioID, startTime, 3600)
	
	response := Response{
		Status: "success",
		Data:   results,
	}
	writeJSONResponse(w, http.StatusOK, response)
}