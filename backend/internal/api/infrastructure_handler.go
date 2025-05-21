// backend/internal/api/infrastructure_handler.go
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

// getInfrastructureHandler gibt die Infrastrukturdaten zurück
func (api *APIRouter) getInfrastructureHandler(w http.ResponseWriter, r *http.Request) {
	// Mock-Daten aus dem Simulationsmodul abrufen
	infraData := simulation.GenerateMockInfrastructure()
	
	response := Response{
		Status: "success",
		Data:   infraData,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// getInfrastructureDetailsHandler gibt detaillierte Informationen zu einer bestimmten Infrastruktur zurück
func (api *APIRouter) getInfrastructureDetailsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// In einer realen Implementierung würden hier die Daten aus der Datenbank abgerufen werden
	// Für den Prototypen verwenden wir generierte Daten
	
	infraData := simulation.GenerateMockInfrastructure()
	
	// Füge die ID hinzu
	infraData["id"] = id
	infraData["name"] = "Cloud Infrastructure " + id
	infraData["description"] = "Generated infrastructure for demonstration purposes"
	
	response := Response{
		Status: "success",
		Data:   infraData,
	}
	writeJSONResponse(w, http.StatusOK, response)
}

// createInfrastructureHandler erstellt eine neue Infrastruktur
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

// importInfrastructureHandler importiert eine Infrastruktur aus einer Konfigurationsdatei
func (api *APIRouter) importInfrastructureHandler(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var requestData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		logging.Logger.Errorf("Error parsing request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request format")
		return
	}
	
	// Überprüfe, ob alle erforderlichen Felder vorhanden sind
	content, contentOk := requestData["content"].(string)
	fileType, typeOk := requestData["type"].(string)
	
	if !contentOk || !typeOk {
		writeErrorResponse(w, http.StatusBadRequest, "Missing required fields: content and type")
		return
	}
	
	// Im echten System würde hier der Inhalt der Datei geparst werden
	// Für den Prototypen generieren wir einfach Mock-Daten
	
	// Mock-Infrastruktur generieren
	infraData := simulation.GenerateMockInfrastructure()
	
	// Füge Metadaten hinzu
	infraData["id"] = "imported-" + uuid.New().String()[0:8]
	infraData["name"] = "Imported Infrastructure"
	infraData["description"] = "Infrastructure imported from " + fileType + " file"
	infraData["importedAt"] = time.Now().Format(time.RFC3339)
	infraData["sourceType"] = fileType
	
	response := Response{
		Status:  "success",
		Message: "Infrastructure imported successfully",
		Data:    infraData,
	}
	writeJSONResponse(w, http.StatusOK, response)
}