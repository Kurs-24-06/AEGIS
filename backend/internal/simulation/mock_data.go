// backend/internal/simulation/mock_data.go
package simulation

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
)

// GenerateMockInfrastructure erzeugt eine Mock-Infrastruktur für Demonstrationszwecke
func GenerateMockInfrastructure() map[string]interface{} {
	// Mock-Netzwerkdefinition
	var nodes []map[string]interface{}
	var connections []map[string]interface{}
	
	// Router hinzufügen
	routerCount := 2
	for i := 0; i < routerCount; i++ {
		router := map[string]interface{}{
			"id":        fmt.Sprintf("router-%d", i+1),
			"name":      fmt.Sprintf("Router %d", i+1),
			"type":      "router",
			"status":    "normal",
			"ipAddress": fmt.Sprintf("10.0.0.%d", i+1),
		}
		nodes = append(nodes, router)
	}
	
	// Server hinzufügen
	serverCount := 5
	for i := 0; i < serverCount; i++ {
		status := "normal"
		if i == 1 {
			status = "warning"
		} else if i == 2 {
			status = "critical"
		}
		
		server := map[string]interface{}{
			"id":        fmt.Sprintf("server-%d", i+1),
			"name":      fmt.Sprintf("Server %d", i+1),
			"type":      "server",
			"status":    status,
			"ipAddress": fmt.Sprintf("10.0.1.%d", i+1),
			"metadata": map[string]interface{}{
				"os":          "Linux",
				"version":     "Ubuntu 22.04",
				"services":    []string{"http", "https", "ssh"},
				"environment": "production",
			},
		}
		nodes = append(nodes, server)
	}
	
	// Workstations hinzufügen
	workstationCount := 8
	for i := 0; i < workstationCount; i++ {
		status := "normal"
		if i == 3 {
			status = "warning"
		}
		
		workstation := map[string]interface{}{
			"id":        fmt.Sprintf("workstation-%d", i+1),
			"name":      fmt.Sprintf("Workstation %d", i+1),
			"type":      "workstation",
			"status":    status,
			"ipAddress": fmt.Sprintf("10.0.2.%d", i+1),
			"metadata": map[string]interface{}{
				"os":      "Windows",
				"version": "Windows 11",
				"user":    fmt.Sprintf("user%d", i+1),
			},
		}
		nodes = append(nodes, workstation)
	}
	
	// Verbindungen zwischen Routern und Servern
	for i := 0; i < routerCount; i++ {
		for j := 0; j < serverCount; j++ {
			if rand.Float64() < 0.7 { // 70% Chance für eine Verbindung
				status := "normal"
				if j == 2 {
					status = "warning"
				}
				
				connection := map[string]interface{}{
					"id":       uuid.New().String()[0:8],
					"source":   fmt.Sprintf("router-%d", i+1),
					"target":   fmt.Sprintf("server-%d", j+1),
					"status":   status,
					"protocol": "TCP",
					"ports":    []string{"80", "443", "22"},
				}
				connections = append(connections, connection)
			}
		}
	}
	
	// Verbindungen zwischen Routern und Workstations
	for i := 0; i < routerCount; i++ {
		for j := 0; j < workstationCount; j++ {
			if rand.Float64() < 0.5 { // 50% Chance für eine Verbindung
				status := "normal"
				if j == 3 {
					status = "critical"
				}
				
				connection := map[string]interface{}{
					"id":       uuid.New().String()[0:8],
					"source":   fmt.Sprintf("router-%d", i+1),
					"target":   fmt.Sprintf("workstation-%d", j+1),
					"status":   status,
					"protocol": "TCP",
					"ports":    []string{"445", "3389"},
				}
				connections = append(connections, connection)
			}
		}
	}
	
	// Verbindungen zwischen Servern
	for i := 0; i < serverCount; i++ {
		for j := i + 1; j < serverCount; j++ {
			if rand.Float64() < 0.3 { // 30% Chance für eine Verbindung
				connection := map[string]interface{}{
					"id":       uuid.New().String()[0:8],
					"source":   fmt.Sprintf("server-%d", i+1),
					"target":   fmt.Sprintf("server-%d", j+1),
					"status":   "normal",
					"protocol": "TCP",
					"ports":    []string{"3306", "5432"},
				}
				connections = append(connections, connection)
			}
		}
	}
	
	return map[string]interface{}{
		"nodes":       nodes,
		"connections": connections,
	}
}

// GenerateMockSimulationScenarios erzeugt Mock-Simulationsszenarien
func GenerateMockSimulationScenarios() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"id":          "scenario-1",
			"name":        "Basic Penetration Test",
			"description": "Ein grundlegender Penetrationstest, der Reconnaissance, Scanning und Exploitation umfasst",
			"difficulty":  "easy",
			"duration":    3600, // 1 Stunde in Sekunden
			"steps": []map[string]interface{}{
				{
					"id":          1,
					"name":        "Reconnaissance",
					"description": "Informationen über das Ziel sammeln",
					"duration":    900, // 15 Minuten
				},
				{
					"id":          2,
					"name":        "Scanning",
					"description": "Scannen nach offenen Ports und Diensten",
					"duration":    1200, // 20 Minuten
				},
				{
					"id":          3,
					"name":        "Exploitation",
					"description": "Ausnutzen von Schwachstellen",
					"duration":    1500, // 25 Minuten
				},
			},
		},
		{
			"id":          "scenario-2",
			"name":        "Advanced Ransomware Simulation",
			"description": "Eine fortgeschrittene Ransomware-Angriffssimulation",
			"difficulty":  "hard",
			"duration":    7200, // 2 Stunden in Sekunden
			"steps": []map[string]interface{}{
				{
					"id":          1,
					"name":        "Initial Access",
					"description": "Zugang über Phishing erlangen",
					"duration":    1200, // 20 Minuten
				},
				{
					"id":          2,
					"name":        "Privilege Escalation",
					"description": "Rechte erhöhen",
					"duration":    1800, // 30 Minuten
				},
				{
					"id":          3,
					"name":        "Lateral Movement",
					"description": "Lateral durch das Netzwerk bewegen",
					"duration":    1500, // 25 Minuten
				},
				{
					"id":          4,
					"name":        "Data Exfiltration",
					"description": "Sensible Daten extrahieren",
					"duration":    1500, // 25 Minuten
				},
				{
					"id":          5,
					"name":        "Encryption",
					"description": "Dateien verschlüsseln und Lösegeld fordern",
					"duration":    1200, // 20 Minuten
				},
			},
		},
		{
			"id":          "scenario-3",
			"name":        "Compliance Check",
			"description": "Überprüfung der Einhaltung von Sicherheitsrichtlinien",
			"difficulty":  "medium",
			"duration":    4500, // 1:15 Stunden in Sekunden
			"steps": []map[string]interface{}{
				{
					"id":          1,
					"name":        "Configuration Audit",
					"description": "Überprüfung der Konfigurationseinstellungen",
					"duration":    1800, // 30 Minuten
				},
				{
					"id":          2,
					"name":        "Access Control Validation",
					"description": "Validierung der Zugriffskontrollen",
					"duration":    1500, // 25 Minuten
				},
				{
					"id":          3,
					"name":        "Policy Compliance",
					"description": "Überprüfung der Einhaltung von Unternehmensrichtlinien",
					"duration":    1200, // 20 Minuten
				},
			},
		},
	}
}

// GenerateMockSimulationResults erzeugt Ergebnisse für eine simulierte Simulation
func GenerateMockSimulationResults(simulationID string, scenarioID string, startTime time.Time, duration int) map[string]interface{} {
	// Zufällige Ergebnisse generieren
	var events []map[string]interface{}
	var vulnerabilities []map[string]interface{}
	
	// Zeitpunkte für die Events berechnen
	endTime := startTime.Add(time.Duration(duration) * time.Second)
	timeRange := endTime.Sub(startTime)
	
	// Events erzeugen
	eventCount := rand.Intn(20) + 10 // 10-30 Events
	for i := 0; i < eventCount; i++ {
		// Zufälligen Zeitpunkt innerhalb der Simulation wählen
		eventTime := startTime.Add(time.Duration(rand.Int63n(int64(timeRange))))
		
		// Zufälligen Event-Typ wählen
		eventTypes := []string{"discovery", "escalation", "exploitation", "lateral_movement", "data_exfiltration", "system"}
		eventType := eventTypes[rand.Intn(len(eventTypes))]
		
		// Zufälligen Schweregrad wählen
		severities := []string{"info", "low", "medium", "high", "critical"}
		severity := severities[rand.Intn(len(severities))]
		
		// Event erstellen
		event := map[string]interface{}{
			"id":           uuid.New().String(),
			"simulationId": simulationID,
			"timestamp":    eventTime.Format(time.RFC3339),
			"type":         eventType,
			"severity":     severity,
			"resourceId":   fmt.Sprintf("resource-%d", rand.Intn(10)+1),
			"description":  generateEventDescription(eventType),
		}
		events = append(events, event)
		
		// Einige Events erzeugen Schwachstellen
		if eventType == "exploitation" && rand.Float64() < 0.7 {
			vuln := map[string]interface{}{
				"id":           uuid.New().String(),
				"name":         generateVulnerabilityName(),
				"description":  generateVulnerabilityDescription(),
				"severity":     severity,
				"resourceId":   event["resourceId"],
				"exploited":    true,
				"remediation":  "Update software and apply security patches",
				"discoveredAt": eventTime.Format(time.RFC3339),
			}
			vulnerabilities = append(vulnerabilities, vuln)
		}
	}
	
	// Zusammenfassung erstellen
	summary := map[string]interface{}{
		"eventsCount":        len(events),
		"vulnerabilitiesCount": len(vulnerabilities),
		"criticalCount":      countEventsBySeverity(events, "critical"),
		"highCount":          countEventsBySeverity(events, "high"),
		"mediumCount":        countEventsBySeverity(events, "medium"),
		"lowCount":           countEventsBySeverity(events, "low"),
		"infoCount":          countEventsBySeverity(events, "info"),
		"startTime":          startTime.Format(time.RFC3339),
		"endTime":            endTime.Format(time.RFC3339),
		"duration":           duration,
		"status":             "completed",
	}
	
	return map[string]interface{}{
		"id":             simulationID,
		"scenarioId":     scenarioID,
		"events":         events,
		"vulnerabilities": vulnerabilities,
		"summary":        summary,
	}
}

// Hilfsfunktionen für die Generierung von Beispieldaten

func generateEventDescription(eventType string) string {
	descriptionsByType := map[string][]string{
		"discovery": {
			"Port scan detected on target system",
			"DNS enumeration attempt detected",
			"Network mapping activity observed",
			"Service discovery scan detected",
			"Vulnerability scanner detected accessing system",
		},
		"escalation": {
			"Attempt to exploit sudo privilege",
			"Password cracking attempt detected",
			"Privilege escalation via kernel exploit",
			"Use of admin credentials detected",
			"Unauthorized access to privileged account",
		},
		"exploitation": {
			"SQL injection attempt detected",
			"Exploitation of CVE-2023-1234 vulnerability",
			"Cross-site scripting attack detected",
			"Remote code execution attempt",
			"Buffer overflow attack detected",
		},
		"lateral_movement": {
			"Unauthorized SMB connection between systems",
			"Remote PowerShell session established",
			"Pass-the-hash attack detected",
			"Suspicious RDP connection established",
			"Lateral movement through internal network detected",
		},
		"data_exfiltration": {
			"Large data transfer to external IP",
			"Suspicious DNS tunneling detected",
			"Data exfiltration attempt via HTTPS",
			"Unusual volume of email attachments",
			"Data compression before transfer detected",
		},
		"system": {
			"Simulation started",
			"Simulation phase completed",
			"Simulation paused by user",
			"Simulation resumed",
			"Simulation completed",
		},
	}
	
	descriptions := descriptionsByType[eventType]
	if len(descriptions) == 0 {
		return "Unknown event occurred"
	}
	
	return descriptions[rand.Intn(len(descriptions))]
}

func generateVulnerabilityName() string {
	vulnerabilityNames := []string{
		"Outdated OpenSSL Version",
		"Default Admin Credentials",
		"Unpatched Windows SMB Vulnerability",
		"SQL Injection in Web Application",
		"Insecure File Permissions",
		"Missing Input Validation",
		"Outdated Apache Version",
		"Cross-Site Scripting (XSS) Vulnerability",
		"Weak SSH Configuration",
		"Unencrypted Data Transmission",
	}
	
	return vulnerabilityNames[rand.Intn(len(vulnerabilityNames))]
}

func generateVulnerabilityDescription() string {
	descriptions := []string{
		"System is running an outdated version with known security vulnerabilities",
		"Application uses default or weak credentials that can be easily guessed",
		"Web application is vulnerable to injection attacks due to lack of input sanitization",
		"Sensitive data is transmitted in clear text over the network",
		"System has unnecessary services exposed to the network",
		"Access controls are not properly implemented, allowing unauthorized access",
		"System has not been updated with the latest security patches",
		"Insecure configuration allows unauthorized access to sensitive information",
		"Application does not validate user input properly, leading to potential attacks",
		"Weak encryption algorithms are used to protect sensitive data",
	}
	
	return descriptions[rand.Intn(len(descriptions))]
}

func countEventsBySeverity(events []map[string]interface{}, severity string) int {
	count := 0
	for _, event := range events {
		if event["severity"] == severity {
			count++
		}
	}
	return count
}