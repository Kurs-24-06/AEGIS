// backend/internal/simulation/repository.go
package simulation

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
)

// Repository ist die Datenzugriffsschicht für Simulationen
type Repository struct {
	db *sql.DB
}

// NewRepository erstellt ein neues Repository
func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

// SaveSimulation speichert eine Simulation in der Datenbank
func (r *Repository) SaveSimulation(sim *Simulation) error {
	// Konvertiere results zu JSON
	var resultsJSON []byte
	var err error
	if sim.Results != nil {
		resultsJSON, err = json.Marshal(sim.Results)
		if err != nil {
			return fmt.Errorf("Fehler beim Serialisieren der Ergebnisse: %v", err)
		}
	}

	// Prüfe, ob die Simulation bereits existiert
	var exists bool
	err = r.db.QueryRow("SELECT EXISTS(SELECT 1 FROM simulations WHERE id = $1)", sim.ID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("Fehler beim Prüfen der Existenz der Simulation: %v", err)
	}

	if exists {
		// Update vorhandene Simulation
		query := `
			UPDATE simulations
			SET name = $1, description = $2, status = $3, start_time = $4, end_time = $5,
				infrastructure_id = $6, scenario_id = $7, progress = $8, threats_detected = $9,
				results_json = $10, updated_at = $11
			WHERE id = $12
		`
		_, err = r.db.Exec(
			query,
			sim.Name, sim.Description, string(sim.Status), sim.StartTime, sim.EndTime,
			sim.InfrastructureID, sim.ScenarioID, sim.Progress, sim.ThreatsDetected,
			resultsJSON, time.Now(), sim.ID,
		)
	} else {
		// Neue Simulation einfügen
		query := `
			INSERT INTO simulations
			(id, name, description, status, start_time, end_time, infrastructure_id,
			scenario_id, progress, threats_detected, results_json, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		`
		_, err = r.db.Exec(
			query,
			sim.ID, sim.Name, sim.Description, string(sim.Status), sim.StartTime, sim.EndTime,
			sim.InfrastructureID, sim.ScenarioID, sim.Progress, sim.ThreatsDetected,
			resultsJSON, sim.CreatedAt, sim.UpdatedAt,
		)
	}

	if err != nil {
		return fmt.Errorf("Fehler beim Speichern der Simulation: %v", err)
	}

	return nil
}

// GetSimulation lädt eine Simulation aus der Datenbank
func (r *Repository) GetSimulation(id string) (*Simulation, error) {
	query := `
		SELECT id, name, description, status, start_time, end_time, infrastructure_id,
			   scenario_id, progress, threats_detected, results_json, created_at, updated_at
		FROM simulations
		WHERE id = $1
	`
	
	var sim Simulation
	var status string
	var resultsJSON []byte
	var startTime, endTime sql.NullTime
	
	err := r.db.QueryRow(query, id).Scan(
		&sim.ID, &sim.Name, &sim.Description, &status, &startTime, &endTime,
		&sim.InfrastructureID, &sim.ScenarioID, &sim.Progress, &sim.ThreatsDetected,
		&resultsJSON, &sim.CreatedAt, &sim.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("Simulation nicht gefunden")
	} else if err != nil {
		return nil, fmt.Errorf("Fehler beim Laden der Simulation: %v", err)
	}
	
	// Status konvertieren
	sim.Status = Status(status)
	
	// Nullable Felder handhaben
	if startTime.Valid {
		sim.StartTime = &startTime.Time
	}
	if endTime.Valid {
		sim.EndTime = &endTime.Time
	}
	
	// Ergebnisse deserialisieren, falls vorhanden
	if len(resultsJSON) > 0 {
		var results map[string]interface{}
		if err := json.Unmarshal(resultsJSON, &results); err != nil {
			logging.Logger.Warnf("Fehler beim Deserialisieren der Ergebnisse: %v", err)
		} else {
			sim.Results = results
		}
	}
	
	return &sim, nil
}

// GetAllSimulations lädt alle Simulationen aus der Datenbank
func (r *Repository) GetAllSimulations() ([]*Simulation, error) {
	query := `
		SELECT id, name, description, status, start_time, end_time, infrastructure_id,
			   scenario_id, progress, threats_detected, results_json, created_at, updated_at
		FROM simulations
		ORDER BY created_at DESC
	`
	
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("Fehler beim Laden der Simulationen: %v", err)
	}
	defer rows.Close()
	
	var simulations []*Simulation
	
	for rows.Next() {
		var sim Simulation
		var status string
		var resultsJSON []byte
		var startTime, endTime sql.NullTime
		
		err := rows.Scan(
			&sim.ID, &sim.Name, &sim.Description, &status, &startTime, &endTime,
			&sim.InfrastructureID, &sim.ScenarioID, &sim.Progress, &sim.ThreatsDetected,
			&resultsJSON, &sim.CreatedAt, &sim.UpdatedAt,
		)
		
		if err != nil {
			return nil, fmt.Errorf("Fehler beim Scannen der Simulation: %v", err)
		}
		
		// Status konvertieren
		sim.Status = Status(status)
		
		// Nullable Felder handhaben
		if startTime.Valid {
			sim.StartTime = &startTime.Time
		}
		if endTime.Valid {
			sim.EndTime = &endTime.Time
		}
		
		// Ergebnisse deserialisieren, falls vorhanden
		if len(resultsJSON) > 0 {
			var results map[string]interface{}
			if err := json.Unmarshal(resultsJSON, &results); err != nil {
				logging.Logger.Warnf("Fehler beim Deserialisieren der Ergebnisse: %v", err)
			} else {
				sim.Results = results
			}
		}
		
		simulations = append(simulations, &sim)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Fehler beim Iterieren über Simulationen: %v", err)
	}
	
	return simulations, nil
}

// SaveEvent speichert ein Event in der Datenbank
func (r *Repository) SaveEvent(event SimulationEvent) error {
	// Konvertiere Details zu JSON
	var detailsJSON []byte
	var err error
	if event.Details != nil {
		detailsJSON, err = json.Marshal(event.Details)
		if err != nil {
			return fmt.Errorf("Fehler beim Serialisieren der Details: %v", err)
		}
	}
	
	query := `
		INSERT INTO simulation_events
		(id, simulation_id, event_type, timestamp, resource_id, details_json, severity)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (id) DO NOTHING
	`
	
	_, err = r.db.Exec(
		query,
		event.ID, event.SimulationID, string(event.Type), event.Timestamp,
		event.ResourceID, detailsJSON, string(event.Severity),
	)
	
	if err != nil {
		return fmt.Errorf("Fehler beim Speichern des Events: %v", err)
	}
	
	return nil
}

// GetEvents lädt alle Events für eine Simulation
func (r *Repository) GetEvents(simulationID string) ([]SimulationEvent, error) {
	query := `
		SELECT id, simulation_id, event_type, timestamp, resource_id, details_json, severity
		FROM simulation_events
		WHERE simulation_id = $1
		ORDER BY timestamp
	`
	
	rows, err := r.db.Query(query, simulationID)
	if err != nil {
		return nil, fmt.Errorf("Fehler beim Laden der Events: %v", err)
	}
	defer rows.Close()
	
	var events []SimulationEvent
	
	for rows.Next() {
		var event SimulationEvent
		var eventType, severity string
		var detailsJSON []byte
		var resourceID sql.NullString
		
		err := rows.Scan(
			&event.ID, &event.SimulationID, &eventType, &event.Timestamp,
			&resourceID, &detailsJSON, &severity,
		)
		
		if err != nil {
			return nil, fmt.Errorf("Fehler beim Scannen des Events: %v", err)
		}
		
		// Typen konvertieren
		event.Type = EventType(eventType)
		event.Severity = Severity(severity)
		
		// Nullable Felder handhaben
		if resourceID.Valid {
			event.ResourceID = resourceID.String
		}
		
		// Details deserialisieren, falls vorhanden
		if len(detailsJSON) > 0 {
			var details map[string]interface{}
			if err := json.Unmarshal(detailsJSON, &details); err != nil {
				logging.Logger.Warnf("Fehler beim Deserialisieren der Details: %v", err)
			} else {
				event.Details = details
			}
		}
		
		events = append(events, event)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Fehler beim Iterieren über Events: %v", err)
	}
	
	return events, nil
}

// SaveAffectedResource speichert eine betroffene Ressource in der Datenbank
func (r *Repository) SaveAffectedResource(resource AffectedResource) error {
	// Konvertiere Vulnerabilities zu JSON
	var vulnerabilitiesJSON []byte
	var err error
	if len(resource.Vulnerabilities) > 0 {
		vulnerabilitiesJSON, err = json.Marshal(resource.Vulnerabilities)
		if err != nil {
			return fmt.Errorf("Fehler beim Serialisieren der Vulnerabilities: %v", err)
		}
	}
	
	// Prüfe, ob die Ressource bereits existiert
	var exists bool
	err = r.db.QueryRow("SELECT EXISTS(SELECT 1 FROM affected_resources WHERE id = $1 AND simulation_id = $2)",
		resource.ID, resource.SimulationID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("Fehler beim Prüfen der Existenz der Ressource: %v", err)
	}
	
	if exists {
		// Update vorhandene Ressource
		query := `
			UPDATE affected_resources
			SET name = $1, type = $2, status = $3, threat_level = $4, attack_vector = $5, vulnerabilities = $6
			WHERE id = $7 AND simulation_id = $8
		`
		_, err = r.db.Exec(
			query,
			resource.Name, resource.Type, string(resource.Status), resource.ThreatLevel,
			resource.AttackVector, vulnerabilitiesJSON, resource.ID, resource.SimulationID,
		)
	} else {
		// Neue Ressource einfügen
		query := `
			INSERT INTO affected_resources
			(id, simulation_id, name, type, status, threat_level, attack_vector, vulnerabilities)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`
		_, err = r.db.Exec(
			query,
			resource.ID, resource.SimulationID, resource.Name, resource.Type,
			string(resource.Status), resource.ThreatLevel, resource.AttackVector, vulnerabilitiesJSON,
		)
	}
	
	if err != nil {
		return fmt.Errorf("Fehler beim Speichern der Ressource: %v", err)
	}
	
	return nil
}

// GetAffectedResources lädt alle betroffenen Ressourcen für eine Simulation
func (r *Repository) GetAffectedResources(simulationID string) ([]AffectedResource, error) {
	query := `
		SELECT id, simulation_id, name, type, status, threat_level, attack_vector, vulnerabilities
		FROM affected_resources
		WHERE simulation_id = $1
	`
	
	rows, err := r.db.Query(query, simulationID)
	if err != nil {
		return nil, fmt.Errorf("Fehler beim Laden der Ressourcen: %v", err)
	}
	defer rows.Close()
	
	var resources []AffectedResource
	
	for rows.Next() {
		var resource AffectedResource
		var status string
		var vulnerabilitiesJSON []byte
		var attackVector sql.NullString
		
		err := rows.Scan(
			&resource.ID, &resource.SimulationID, &resource.Name, &resource.Type,
			&status, &resource.ThreatLevel, &attackVector, &vulnerabilitiesJSON,
		)
		
		if err != nil {
			return nil, fmt.Errorf("Fehler beim Scannen der Ressource: %v", err)
		}
		
		// Status konvertieren
		resource.Status = ResourceStatus(status)
		
		// Nullable Felder handhaben
		if attackVector.Valid {
			resource.AttackVector = attackVector.String
		}
		
		// Vulnerabilities deserialisieren, falls vorhanden
		if len(vulnerabilitiesJSON) > 0 {
			var vulnerabilities []string
			if err := json.Unmarshal(vulnerabilitiesJSON, &vulnerabilities); err != nil {
				logging.Logger.Warnf("Fehler beim Deserialisieren der Vulnerabilities: %v", err)
			} else {
				resource.Vulnerabilities = vulnerabilities
			}
		}
		
		resources = append(resources, resource)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Fehler beim Iterieren über Ressourcen: %v", err)
	}
	
	return resources, nil
}