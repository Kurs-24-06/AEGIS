// backend/internal/simulation/service_test.go
package simulation

import (
	"testing"
	"time"
)

func TestSimulationService(t *testing.T) {
    // Service initialisieren
    service := GetService()
    
    // Konfiguration für neue Simulation
    config := SimulationConfig{
        Name:            "Test Simulation",
        Description:     "Eine Testsimulation",
        InfrastructureID: "infrastructure-test",
        ScenarioID:      "scenario-test",
    }
    
    // Simulation erstellen
    sim, err := service.CreateSimulation(config)
    if err != nil {
        t.Fatalf("Fehler beim Erstellen der Simulation: %v", err)
    }
    
    // ID der Simulation prüfen
    if sim.ID == "" {
        t.Fatal("Simulations-ID ist leer")
    }
    
    // Status prüfen
    if sim.Status != StatusNotStarted {
        t.Fatalf("Erwarteter Status: %s, Erhaltener Status: %s", StatusNotStarted, sim.Status)
    }
    
    // Simulation starten
    startedSim, err := service.StartSimulation(sim.ID)
    if err != nil {
        t.Fatalf("Fehler beim Starten der Simulation: %v", err)
    }
    
    // Status prüfen
    if startedSim.Status != StatusRunning {
        t.Fatalf("Erwarteter Status: %s, Erhaltener Status: %s", StatusRunning, startedSim.Status)
    }
    
    // StartTime prüfen
    if startedSim.StartTime == nil {
        t.Fatal("StartTime ist nil nach dem Starten der Simulation")
    }
    
    // Etwas Zeit für die Simulation geben
    time.Sleep(100 * time.Millisecond)
    
    // Status abrufen
    status, err := service.GetSimulationStatus(sim.ID)
    if err != nil {
        t.Fatalf("Fehler beim Abrufen des Simulationsstatus: %v", err)
    }
    
    // Status und Runtime prüfen
    if status.Status != StatusRunning {
        t.Fatalf("Erwarteter Status: %s, Erhaltener Status: %s", StatusRunning, status.Status)
    }
    if status.Runtime == "" {
        t.Fatal("Runtime ist leer")
    }
    
    // Simulation stoppen
    stoppedSim, err := service.StopSimulation(sim.ID)
    if err != nil {
        t.Fatalf("Fehler beim Stoppen der Simulation: %v", err)
    }
    
    // Status prüfen
    if stoppedSim.Status != StatusStopped {
        t.Fatalf("Erwarteter Status: %s, Erhaltener Status: %s", StatusStopped, stoppedSim.Status)
    }
    
    // EndTime prüfen
    if stoppedSim.EndTime == nil {
        t.Fatal("EndTime ist nil nach dem Stoppen der Simulation")
    }
}