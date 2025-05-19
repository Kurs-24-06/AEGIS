// backend/internal/simulation/engine.go
package simulation

import (
	"context"
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
	"github.com/google/uuid"
)

// Engine ist die Hauptsimulations-Engine
type Engine struct {
	simulations     map[string]*Simulation
	events          map[string][]SimulationEvent
	affectedResources map[string][]AffectedResource
	mutex          sync.RWMutex
	stopChannels   map[string]chan struct{}
}

// NewEngine erstellt eine neue Simulation-Engine
func NewEngine() *Engine {
	return &Engine{
		simulations:      make(map[string]*Simulation),
		events:           make(map[string][]SimulationEvent),
		affectedResources: make(map[string][]AffectedResource),
		stopChannels:     make(map[string]chan struct{}),
	}
}

// CreateSimulation erstellt eine neue Simulation
func (e *Engine) CreateSimulation(config SimulationConfig) (*Simulation, error) {
	e.mutex.Lock()
	defer e.mutex.Unlock()

	// Generiere ID für die Simulation
	id := uuid.New().String()
	now := time.Now()

	// Erstelle die Simulation
	simulation := &Simulation{
		ID:              id,
		Name:            config.Name,
		Description:     config.Description,
		Status:          StatusNotStarted,
		InfrastructureID: config.InfrastructureID,
		ScenarioID:      config.ScenarioID,
		Progress:        0,
		ThreatsDetected: 0,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	// Speichere die Simulation
	e.simulations[id] = simulation
	e.events[id] = []SimulationEvent{}
	e.affectedResources[id] = []AffectedResource{}

	logging.Logger.Infof("Simulation '%s' (ID: %s) erstellt", simulation.Name, simulation.ID)
	return simulation, nil
}

// StartSimulation startet eine Simulation
func (e *Engine) StartSimulation(id string) (*Simulation, error) {
	e.mutex.Lock()
	
	simulation, exists := e.simulations[id]
	if !exists {
		e.mutex.Unlock()
		return nil, fmt.Errorf("Simulation mit ID %s nicht gefunden", id)
	}

	// Prüfe, ob die Simulation bereits läuft
	if simulation.Status == StatusRunning {
		e.mutex.Unlock()
		return simulation, nil
	}

	// Aktualisiere den Status
	now := time.Now()
	simulation.Status = StatusRunning
	simulation.StartTime = &now
	simulation.UpdatedAt = now

	// Erstelle Stopp-Kanal
	stopChan := make(chan struct{})
	e.stopChannels[id] = stopChan
	
	e.mutex.Unlock()

	// Erstelle initiales Event
	e.AddEvent(id, SimulationEvent{
		ID:           uuid.New().String(),
		SimulationID: id,
		Timestamp:    now,
		Type:         EventTypeSystem,
		Description:  "Simulation gestartet",
		Severity:     SeverityInfo,
	})

	// Starte die Simulation in einem eigenen Goroutine
	go e.runSimulation(id, stopChan)

	logging.Logger.Infof("Simulation '%s' (ID: %s) gestartet", simulation.Name, simulation.ID)
	return simulation, nil
}

// StopSimulation stoppt eine laufende Simulation
func (e *Engine) StopSimulation(id string) (*Simulation, error) {
	e.mutex.Lock()
	
	simulation, exists := e.simulations[id]
	if !exists {
		e.mutex.Unlock()
		return nil, fmt.Errorf("Simulation mit ID %s nicht gefunden", id)
	}

	// Prüfe, ob die Simulation läuft
	if simulation.Status != StatusRunning && simulation.Status != StatusPaused {
		e.mutex.Unlock()
		return simulation, nil
	}

	// Sende Stopp-Signal
	stopChan, exists := e.stopChannels[id]
	if exists {
		close(stopChan)
		delete(e.stopChannels, id)
	}

	// Aktualisiere den Status
	now := time.Now()
	simulation.Status = StatusStopped
	simulation.EndTime = &now
	simulation.UpdatedAt = now
	
	e.mutex.Unlock()

	// Erstelle Event
	e.AddEvent(id, SimulationEvent{
		ID:           uuid.New().String(),
		SimulationID: id,
		Timestamp:    now,
		Type:         EventTypeSystem,
		Description:  "Simulation manuell gestoppt",
		Severity:     SeverityInfo,
	})

	logging.Logger.Infof("Simulation '%s' (ID: %s) gestoppt", simulation.Name, simulation.ID)
	return simulation, nil
}

// PauseSimulation pausiert eine laufende Simulation
func (e *Engine) PauseSimulation(id string) (*Simulation, error) {
	e.mutex.Lock()
	defer e.mutex.Unlock()
	
	simulation, exists := e.simulations[id]
	if !exists {
		return nil, fmt.Errorf("Simulation mit ID %s nicht gefunden", id)
	}

	// Prüfe, ob die Simulation läuft
	if simulation.Status != StatusRunning {
		return simulation, nil
	}

	// Aktualisiere den Status
	now := time.Now()
	simulation.Status = StatusPaused
	simulation.UpdatedAt = now

	// TODO: Implementiere Pausier-Mechanismus für den Simulations-Worker

	logging.Logger.Infof("Simulation '%s' (ID: %s) pausiert", simulation.Name, simulation.ID)
	return simulation, nil
}

// GetSimulation gibt eine Simulation zurück
func (e *Engine) GetSimulation(id string) (*Simulation, error) {
	e.mutex.RLock()
	defer e.mutex.RUnlock()
	
	simulation, exists := e.simulations[id]
	if !exists {
		return nil, fmt.Errorf("Simulation mit ID %s nicht gefunden", id)
	}
	
	return simulation, nil
}

// GetSimulations gibt alle Simulationen zurück
func (e *Engine) GetSimulations() []*Simulation {
	e.mutex.RLock()
	defer e.mutex.RUnlock()
	
	simulations := make([]*Simulation, 0, len(e.simulations))
	for _, simulation := range e.simulations {
		simulations = append(simulations, simulation)
	}
	
	return simulations
}

// GetSimulationStatus gibt den Status einer Simulation zurück
func (e *Engine) GetSimulationStatus(id string) (*SimulationStatus, error) {
	e.mutex.RLock()
	defer e.mutex.RUnlock()
	
	simulation, exists := e.simulations[id]
	if !exists {
		return nil, fmt.Errorf("Simulation mit ID %s nicht gefunden", id)
	}
	
	var runtime string
	if simulation.StartTime != nil {
		var endTime time.Time
		if simulation.EndTime != nil {
			endTime = *simulation.EndTime
		} else {
			endTime = time.Now()
		}
		
		duration := endTime.Sub(*simulation.StartTime)
		hours := int(duration.Hours())
		minutes := int(duration.Minutes()) % 60
		seconds := int(duration.Seconds()) % 60
		runtime = fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
	} else {
		runtime = "00:00:00"
	}
	
	// Zähle kompromittierte Ressourcen
	var compromisedResources int
	for _, resource := range e.affectedResources[id] {
		if resource.Status == ResourceStatusCompromised {
			compromisedResources++
		}
	}
	
	return &SimulationStatus{
		ID:                 simulation.ID,
		Status:             simulation.Status,
		Runtime:            runtime,
		ThreatsDetected:    simulation.ThreatsDetected,
		CompromisedResources: compromisedResources,
		Progress:           simulation.Progress,
	}, nil
}

// AddEvent fügt ein Event zu einer Simulation hinzu
func (e *Engine) AddEvent(simulationID string, event SimulationEvent) {
	e.mutex.Lock()
	defer e.mutex.Unlock()
	
	if _, exists := e.events[simulationID]; !exists {
		e.events[simulationID] = []SimulationEvent{}
	}
	
	e.events[simulationID] = append(e.events[simulationID], event)
	
	// Aktualisiere die Threatcounter, wenn es sich um ein Exploitation-Event handelt
	if event.Type == EventTypeExploitation {
		if simulation, exists := e.simulations[simulationID]; exists {
			simulation.ThreatsDetected++
		}
	}
}

// GetEvents gibt die Events einer Simulation zurück
func (e *Engine) GetEvents(simulationID string) ([]SimulationEvent, error) {
	e.mutex.RLock()
	defer e.mutex.RUnlock()
	
	if _, exists := e.simulations[simulationID]; !exists {
		return nil, fmt.Errorf("Simulation mit ID %s nicht gefunden", simulationID)
	}
	
	events, exists := e.events[simulationID]
	if !exists {
		return []SimulationEvent{}, nil
	}
	
	return events, nil
}

// AddAffectedResource fügt eine betroffene Ressource zu einer Simulation hinzu
func (e *Engine) AddAffectedResource(simulationID string, resource AffectedResource) {
	e.mutex.Lock()
	defer e.mutex.Unlock()
	
	if _, exists := e.affectedResources[simulationID]; !exists {
		e.affectedResources[simulationID] = []AffectedResource{}
	}
	
	e.affectedResources[simulationID] = append(e.affectedResources[simulationID], resource)
}

// GetAffectedResources gibt die betroffenen Ressourcen einer Simulation zurück
func (e *Engine) GetAffectedResources(simulationID string) ([]AffectedResource, error) {
	e.mutex.RLock()
	defer e.mutex.RUnlock()
	
	if _, exists := e.simulations[simulationID]; !exists {
		return nil, fmt.Errorf("Simulation mit ID %s nicht gefunden", simulationID)
	}
	
	resources, exists := e.affectedResources[simulationID]
	if !exists {
		return []AffectedResource{}, nil
	}
	
	return resources, nil
}

// UpdateResourceStatus aktualisiert den Status einer Ressource
func (e *Engine) UpdateResourceStatus(simulationID string, resourceID string, status ResourceStatus) error {
	e.mutex.Lock()
	defer e.mutex.Unlock()
	
	resources, exists := e.affectedResources[simulationID]
	if !exists {
		return fmt.Errorf("Simulation mit ID %s nicht gefunden", simulationID)
	}
	
	for i, resource := range resources {
		if resource.ID == resourceID {
			resources[i].Status = status
			return nil
		}
	}
	
	return fmt.Errorf("Ressource mit ID %s nicht gefunden", resourceID)
}

// Füge diese Private-Methode am Ende der Datei hinzu
func (e *Engine) runSimulation(id string, stopChan <-chan struct{}) {
	// Initialisiere den simulation context
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialisiere die Phase und den Fortschritt
	var progress float64 = 0
	phase := 1
	maxPhases := 5 // Anzahl der Phasen in einer typischen Penetration
	
	// Hauptsimulationsschleife
	ticker := time.NewTicker(10 * time.Second) // Periodische Updates
	defer ticker.Stop()
	
	logging.Logger.Infof("Simulationsschleife für ID %s gestartet", id)

	for {
		select {
		case <-stopChan:
			logging.Logger.Infof("Simulation %s gestoppt", id)
			cancel()
			return
		case <-ctx.Done():
			logging.Logger.Infof("Simulation %s durch Kontext abgebrochen", id)
			return
		case <-ticker.C:
			// Periodisches Update
			e.mutex.Lock()
			simulation, exists := e.simulations[id]
			
			if !exists || simulation.Status != StatusRunning {
				e.mutex.Unlock()
				return
			}
			
			// Fortschritt aktualisieren (simuliere Fortschritt)
			progress += 0.02 // Erhöhe den Fortschritt um 2%
			if progress >= float64(phase)/float64(maxPhases) && phase < maxPhases {
				// Fortschritt zur nächsten Phase
				phase++
				
				// Ereignis für den Phasenübergang erzeugen
				phaseName := ""
				eventType := EventTypeSystem
				
				switch phase {
				case 2:
					phaseName = "Reconnaissance"
					eventType = EventTypeDiscovery
				case 3:
					phaseName = "Initial Access"
					eventType = EventTypeExploitation
				case 4:
					phaseName = "Privilege Escalation"
					eventType = EventTypeEscalation
				case 5:
					phaseName = "Lateral Movement"
					eventType = EventTypeLateralMovement
				}
				
				if phaseName != "" {
					now := time.Now()
					
					// Erstelle ein Event für den Übergang
					e.mutex.Unlock() // Unlock vor dem Aufrufen von AddEvent, die auch den Mutex verwendet
					e.AddEvent(id, SimulationEvent{
						ID:           uuid.New().String(),
						SimulationID: id,
						Timestamp:    now,
						Type:         eventType,
						Description:  fmt.Sprintf("Phase gestartet: %s", phaseName),
						Severity:     SeverityInfo,
					})
					e.mutex.Lock() // Lock wieder erhalten
				}
			}
			
			if progress >= 1.0 {
				// Simulation abgeschlossen
				now := time.Now()
				simulation.Status = StatusCompleted
				simulation.EndTime = &now
				simulation.Progress = 1.0
				simulation.UpdatedAt = now
				delete(e.stopChannels, id)
				e.mutex.Unlock()
				
				// Erstelle ein Abschlussereignis
				e.AddEvent(id, SimulationEvent{
					ID:           uuid.New().String(),
					SimulationID: id,
					Timestamp:    now,
					Type:         EventTypeSystem,
					Description:  "Simulation erfolgreich abgeschlossen",
					Severity:     SeverityInfo,
				})
				
				logging.Logger.Infof("Simulation %s abgeschlossen", id)
				return
			}
			
			// Fortschritt aktualisieren
			simulation.Progress = progress
			simulation.UpdatedAt = time.Now()
			e.mutex.Unlock()
			
			// Zufälliges Ereignis generieren (für eine realistischere Simulation)
			if rand.Float64() < 0.3 { // 30% Chance für ein Ereignis
				e.generateRandomEvent(id, phase)
			}
		}
	}
}

// generateRandomEvent generiert ein zufälliges Ereignis für eine Simulation
func (e *Engine) generateRandomEvent(simulationID string, phase int) {
	// Ressourcen-IDs für die Simulation abrufen
	resources, err := e.GetAffectedResources(simulationID)
	if err != nil || len(resources) == 0 {
		// Wenn keine Ressourcen vorhanden sind, erstelle eine neue
		resourceID := fmt.Sprintf("resource-%s", uuid.New().String()[0:8])
		
		resourceTypes := []string{"server", "workstation", "router", "database"}
		resourceType := resourceTypes[rand.Intn(len(resourceTypes))]
		
		resourceName := fmt.Sprintf("%s-%d", resourceType, rand.Intn(100))
		
		resource := AffectedResource{
			ID:           resourceID,
			SimulationID: simulationID,
			Name:         resourceName,
			Type:         resourceType,
			Status:       ResourceStatusVulnerable,
			ThreatLevel:  0.2,
		}
		
		e.AddAffectedResource(simulationID, resource)
		resources = append(resources, resource)
	}
	
	// Wähle eine zufällige Ressource
	resourceIndex := rand.Intn(len(resources))
	resource := resources[resourceIndex]
	
	// Basierend auf der Phase, generiere ein Ereignis
	eventType := EventTypeSystem
	description := ""
	severity := SeverityInfo
	
	switch phase {
	case 1, 2:
		// Reconnaissance Phase
		eventType = EventTypeDiscovery
		descriptions := []string{
			"Port-Scan durchgeführt",
			"DNS-Informationen abgerufen",
			"Webserver-Header analysiert",
			"Offene Dienste identifiziert",
			"Betriebssystem-Fingerprinting durchgeführt",
		}
		description = descriptions[rand.Intn(len(descriptions))]
		severities := []Severity{SeverityInfo, SeverityLow}
		severity = severities[rand.Intn(len(severities))]
		
	case 3:
		// Initial Access Phase
		eventType = EventTypeExploitation
		descriptions := []string{
			"Versuch einer SQL-Injection",
			"Ausnutzung einer bekannten Schwachstelle",
			"Brute-Force-Angriff auf Login-Formular",
			"Phishing-E-Mail gesendet",
			"Fehlkonfiguration ausgenutzt",
		}
		description = descriptions[rand.Intn(len(descriptions))]
		severities := []Severity{SeverityMedium, SeverityHigh}
		severity = severities[rand.Intn(len(severities))]
		
		// Update resource status
		if rand.Float64() < 0.7 { // 70% Chance für erfolgreiche Exploitation
			e.UpdateResourceStatus(simulationID, resource.ID, ResourceStatusAttacked)
		}
		
	case 4:
		// Privilege Escalation Phase
		eventType = EventTypeEscalation
		descriptions := []string{
			"Privilege Escalation über unsichere Berechtigung",
			"Ausnutzung einer Kernel-Schwachstelle",
			"Passwort in Klartext gefunden",
			"Lateral Movement zu kritischem System",
			"Zugangsdaten gestohlen",
		}
		description = descriptions[rand.Intn(len(descriptions))]
		severities := []Severity{SeverityHigh, SeverityCritical}
		severity = severities[rand.Intn(len(severities))]
		
		// Update resource status
		if rand.Float64() < 0.6 { // 60% Chance für erfolgreiche Eskalation
			e.UpdateResourceStatus(simulationID, resource.ID, ResourceStatusCompromised)
		}
		
	case 5:
		// Lateral Movement & Data Exfiltration Phase
		if rand.Float64() < 0.5 {
			eventType = EventTypeLateralMovement
			descriptions := []string{
				"Bewegung zum nächsten Netzwerksegment",
				"Verwendung gestohlener Anmeldeinformationen",
				"Remote-Codeausführung",
				"Nutzung des Pass-the-Hash-Angriffs",
				"Erstellung eines neuen Administratorkontos",
			}
			description = descriptions[rand.Intn(len(descriptions))]
		} else {
			eventType = EventTypeDataExfiltration
			descriptions := []string{
				"Datenexfiltration über verschlüsselten Tunnel",
				"Kopieren sensibler Dateien",
				"E-Mail-Extraktion über SMTP",
				"Datenbank-Dump erstellt",
				"Ausführen von Ransomware",
			}
			description = descriptions[rand.Intn(len(descriptions))]
		}
		severities := []Severity{SeverityHigh, SeverityCritical}
		severity = severities[rand.Intn(len(severities))]
	}
	
	// Erstelle das Ereignis
	now := time.Now()
	event := SimulationEvent{
		ID:           uuid.New().String(),
		SimulationID: simulationID,
		Timestamp:    now,
		Type:         eventType,
		Description:  description,
		ResourceID:   resource.ID,
		Severity:     severity,
		Details:      map[string]interface{}{"resource": resource.Name, "phase": phase},
	}
	
	e.AddEvent(simulationID, event)
}
