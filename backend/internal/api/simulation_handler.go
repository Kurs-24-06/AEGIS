// backend/internal/api/simulation_handler.go
package api

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

// formatTimeRFC3339 formats a time.Time to RFC3339 string or returns nil if zero
func formatTimeRFC3339(t time.Time) interface{} {
	if t.IsZero() {
		return nil
	}
	return t.Format(time.RFC3339)
}

// determineScenarioID bestimmt die Simulationsparameter basierend auf der ID
func determineScenarioID(id string) string {
	idNumber, err := strconv.Atoi(id[len(id)-1:])
	if err == nil && idNumber%3 == 0 {
		return "scenario-2" // Ransomware-Szenario
	} else if err == nil && idNumber%2 == 0 {
		return "scenario-3" // Compliance-Szenario
	} else {
		return "scenario-1" // Penetrationstest-Szenario
	}
}


// determineStatusAndEndTime determines simulation status and endTime based on progress
func determineStatusAndEndTime(progress int) (string, time.Time) {
	status := "running"
	var endTime time.Time
	if progress >= 100 {
		status = "completed"
		endTime = time.Now().Add(-5 * time.Minute)
	} else if progress == 0 {
		status = "not_started"
	}
	return status, endTime
}

// calculateRuntime calculates runtime string from startTime
func calculateRuntime(startTime time.Time) string {
	duration := time.Since(startTime)
	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60
	seconds := int(duration.Seconds()) % 60
	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
}

// getSimulationsHandler gibt alle Simulationen zurück
// getSimulationHandler gibt eine bestimmte Simulation zurück
// (implementation is in router.go)



func (api *APIRouter) getSimulationStatusHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Erstelle beispielhafte Statusdaten
	// Diese würden in einer realen Implementierung aus der Datenbank oder dem Simulationsprozess kommen
	
	// Berechne eine simulierte Laufzeit
	startTime := time.Now().Add(-45 * time.Minute)
	endTime := time.Time{}

	progress := calculateProgress(id)
	status, endTime := determineStatusAndEndTime(progress)

	if status == "not_started" {
		startTime = time.Time{}
	}

	runtime := calculateRuntime(startTime)

	// Hier könnten weitere Statusdaten ergänzt werden
	statusData := map[string]interface{}{
		"id":              id,
		"status":          status,
		"progress":        progress,
		"runtime":         runtime,
		"startTime":       formatTimeRFC3339(startTime),
		"endTime":         formatTimeRFC3339(endTime),
		"threatsDetected": progress / 10,
	}

	response := Response{
		Status: "success",
		Data:   statusData,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

