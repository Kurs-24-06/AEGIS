// backend/internal/simulation/service.go
package simulation

import (
	"fmt"
	"sync"

	"github.com/Kurs-24-06/aegis/backend/internal/observability/logging"
)

// Service verwaltet den Zugriff auf die Simulations-Engine
type Service struct {
	engine *Engine
	once   sync.Once
}

// Singleton-Instanz
var instance *Service
var once sync.Once

// GetService gibt die Singleton-Instanz des Services zurück
func GetService() *Service {
	once.Do(func() {
		instance = &Service{
			engine: NewEngine(),
		}
		logging.Logger.Info("Simulations-Service initialisiert")
	})
	return instance
}

// CreateSimulation erstellt eine neue Simulation
func (s *Service) CreateSimulation(config SimulationConfig) (*Simulation, error) {
	simulation, err := s.engine.CreateSimulation(config)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Erstellen der Simulation: %v", err)
		return nil, err
	}
	return simulation, nil
}

// StartSimulation startet eine Simulation
func (s *Service) StartSimulation(id string) (*Simulation, error) {
	simulation, err := s.engine.StartSimulation(id)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Starten der Simulation %s: %v", id, err)
		return nil, err
	}
	return simulation, nil
}

// StopSimulation stoppt eine Simulation
func (s *Service) StopSimulation(id string) (*Simulation, error) {
	simulation, err := s.engine.StopSimulation(id)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Stoppen der Simulation %s: %v", id, err)
		return nil, err
	}
	return simulation, nil
}

// PauseSimulation pausiert eine Simulation
func (s *Service) PauseSimulation(id string) (*Simulation, error) {
	simulation, err := s.engine.PauseSimulation(id)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Pausieren der Simulation %s: %v", id, err)
		return nil, err
	}
	return simulation, nil
}

// GetSimulation gibt eine Simulation zurück
func (s *Service) GetSimulation(id string) (*Simulation, error) {
	simulation, err := s.engine.GetSimulation(id)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Abrufen der Simulation %s: %v", id, err)
		return nil, err
	}
	return simulation, nil
}

// GetSimulations gibt alle Simulationen zurück
func (s *Service) GetSimulations() []*Simulation {
	return s.engine.GetSimulations()
}

// GetSimulationStatus gibt den Status einer Simulation zurück
func (s *Service) GetSimulationStatus(id string) (*SimulationStatus, error) {
	status, err := s.engine.GetSimulationStatus(id)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Abrufen des Status der Simulation %s: %v", id, err)
		return nil, err
	}
	return status, nil
}

// GetEvents gibt die Events einer Simulation zurück
func (s *Service) GetEvents(simulationID string) ([]SimulationEvent, error) {
	events, err := s.engine.GetEvents(simulationID)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Abrufen der Events der Simulation %s: %v", simulationID, err)
		return nil, err
	}
	return events, nil
}

// GetAffectedResources gibt die betroffenen Ressourcen einer Simulation zurück
func (s *Service) GetAffectedResources(simulationID string) ([]AffectedResource, error) {
	resources, err := s.engine.GetAffectedResources(simulationID)
	if err != nil {
		logging.Logger.Errorf("Fehler beim Abrufen der betroffenen Ressourcen der Simulation %s: %v", simulationID, err)
		return nil, err
	}
	return resources, nil
}

// AddMockData fügt Beispieldaten für Testzwecke hinzu
func (s *Service) AddMockData() {
    // Erstelle eine Beispielsimulation
    config := SimulationConfig{
        Name:            "Demo-Simulation",
        Description:     "Automatisch generierte Beispielsimulation für Testzwecke",
        InfrastructureID: "infrastructure-demo",
        ScenarioID:      "scenario-basic-pentest",
    }
    
    sim, err := s.CreateSimulation(config)
    if err != nil {
        logging.Logger.Errorf("Fehler beim Erstellen der Demo-Simulation: %v", err)
        return
    }
    
    // Füge einige Ressourcen hinzu
    resources := []struct {
        name   string
        typ    string
        status ResourceStatus
    }{
        {"Web Server", "server", ResourceStatusNormal},
        {"Database Server", "server", ResourceStatusVulnerable},
        {"Admin Workstation", "workstation", ResourceStatusNormal},
        {"Gateway Router", "router", ResourceStatusNormal},
        {"File Server", "server", ResourceStatusVulnerable},
    }
    
    for i, res := range resources {
        resource := AffectedResource{
            ID:           fmt.Sprintf("resource-%d", i+1),
            SimulationID: sim.ID,
            Name:         res.name,
            Type:         res.typ,
            Status:       res.status,
            ThreatLevel:  float64(i) * 0.2,
        }
        s.engine.AddAffectedResource(sim.ID, resource)
    }
    
    logging.Logger.Infof("Demo-Simulation erstellt mit ID: %s", sim.ID)
}