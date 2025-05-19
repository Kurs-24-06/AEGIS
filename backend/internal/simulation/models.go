// backend/internal/simulation/models.go
package simulation

import (
	"time"
)

// Status repräsentiert den Status einer Simulation
type Status string

const (
	StatusNotStarted Status = "not_started"
	StatusRunning    Status = "running"
	StatusPaused     Status = "paused"
	StatusCompleted  Status = "completed"
	StatusStopped    Status = "stopped"
	StatusFailed     Status = "failed"
)

// EventType repräsentiert den Typ eines Simulationsereignisses
type EventType string

const (
	EventTypeDiscovery      EventType = "discovery"
	EventTypeEscalation     EventType = "escalation"
	EventTypeExploitation   EventType = "exploitation"
	EventTypeLateralMovement EventType = "lateral_movement"
	EventTypeDataExfiltration EventType = "data_exfiltration"
	EventTypeSystem         EventType = "system"
)

// Severity repräsentiert den Schweregrad eines Ereignisses
type Severity string

const (
	SeverityInfo    Severity = "info"
	SeverityLow     Severity = "low"
	SeverityMedium  Severity = "medium"
	SeverityHigh    Severity = "high"
	SeverityCritical Severity = "critical"
)

// ResourceStatus repräsentiert den Status einer betroffenen Ressource
type ResourceStatus string

const (
	ResourceStatusNormal       ResourceStatus = "normal"
	ResourceStatusVulnerable   ResourceStatus = "vulnerable"
	ResourceStatusAttacked     ResourceStatus = "attacked"
	ResourceStatusCompromised  ResourceStatus = "compromised"
)

// Simulation repräsentiert eine Sicherheitssimulation
type Simulation struct {
	ID              string      `json:"id"`
	Name            string      `json:"name"`
	Description     string      `json:"description"`
	Status          Status      `json:"status"`
	StartTime       *time.Time  `json:"startTime,omitempty"`
	EndTime         *time.Time  `json:"endTime,omitempty"`
	InfrastructureID string     `json:"infrastructureId"`
	ScenarioID      string      `json:"scenarioId"`
	Progress        float64     `json:"progress"`
	ThreatsDetected int         `json:"threatsDetected"`
	Results         interface{} `json:"results,omitempty"`
	CreatedAt       time.Time   `json:"createdAt"`
	UpdatedAt       time.Time   `json:"updatedAt"`
}

// SimulationEvent repräsentiert ein Ereignis während einer Simulation
type SimulationEvent struct {
	ID            string     `json:"id"`
	SimulationID  string     `json:"simulationId"`
	Timestamp     time.Time  `json:"timestamp"`
	Type          EventType  `json:"type"`
	Description   string     `json:"description"`
	ResourceID    string     `json:"resourceId,omitempty"`
	Severity      Severity   `json:"severity"`
	Details       interface{} `json:"details,omitempty"`
}

// AffectedResource repräsentiert eine von der Simulation betroffene Ressource
type AffectedResource struct {
	ID              string          `json:"id"`
	SimulationID    string          `json:"simulationId"`
	Name            string          `json:"name"`
	Type            string          `json:"type"`
	Status          ResourceStatus  `json:"status"`
	ThreatLevel     float64         `json:"threatLevel"`
	AttackVector    string          `json:"attackVector,omitempty"`
	Vulnerabilities []string        `json:"vulnerabilities,omitempty"`
}

// SimulationConfig enthält die Konfiguration für eine Simulation
type SimulationConfig struct {
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	InfrastructureID string  `json:"infrastructureId"`
	ScenarioID      string   `json:"scenarioId"`
	Parameters      map[string]interface{} `json:"parameters,omitempty"`
}

// SimulationStatus enthält den aktuellen Status einer Simulation
type SimulationStatus struct {
	ID                  string  `json:"id"`
	Status              Status  `json:"status"`
	Runtime             string  `json:"runtime"`
	ThreatsDetected     int     `json:"threatsDetected"`
	CompromisedResources int    `json:"compromisedResources"`
	Progress            float64 `json:"progress"`
}