# AEGIS – Adaptive Environment for Guided Intrusion Simulation

<div align="center">
  
![AEGIS Banner](https://img.shields.io/badge/AEGIS-Cybersecurity%20Simulation-blue?style=for-the-badge&logo=shield&logoColor=white)

[![Build Status](https://img.shields.io/github/actions/workflow/status/Kurs-24-06/aegis/ci.yml?branch=main&style=for-the-badge)](https://github.com/Kurs-24-06/AEGIS/actions)
[![License](https://img.shields.io/github/license/Kurs-24-06/aegis?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/Kurs-24-06/aegis?style=for-the-badge)](https://github.com/Kurs-24-06/AEGIS/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Kurs-24-06/aegis?style=for-the-badge)](https://github.com/Kurs-24-06/AEGIS/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/Kurs-24-06/aegis?style=for-the-badge)](https://github.com/Kurs-24-06/AEGIS/commits/main)

</div>

> AEGIS ist eine innovative Plattform zur sicheren Simulation von Schwachstellen in Cloud-Infrastrukturen. Ziel ist es, die tatsächlichen Auswirkungen von Angriffen realistisch, aber risikofrei zu demonstrieren.

## 📑 Inhaltsverzeichnis

- [Überblick](#überblick)
- [Zielsetzung](#-zielsetzung)
- [Features](#-features)
- [Technische Architektur](#-technische-architektur)
- [Kernfunktionen](#-kernfunktionen)
- [Projektstruktur](#-projektstruktur)
- [Quick Start](#-quick-start)
- [Roadmap](#-roadmap)
- [Besonderheiten](#-besonderheiten)
- [Beiträge](#-beiträge)
- [Lizenz](#-lizenz)
- [Kontakt](#-kontakt)

## Überblick

AEGIS (Adaptive Environment for Guided Intrusion Simulation) ermöglicht ein realistisches, aber risikofreies Testen von Sicherheitsmaßnahmen durch die Simulation potenzieller Angriffe auf digitale Zwillinge von Cloud-Infrastrukturen. Die Plattform dient sowohl als Lernumgebung als auch als strategisches Tool zur Bewertung von Sicherheitsrisiken.

## 🚀 Zielsetzung

- **Sichere Simulation** von Sicherheitslücken ohne Gefährdung der Produktivumgebung
- **Förderung des Verständnisses** für Angriffsmuster und deren Abwehrmechanismen
- **Unterstützung** bei Compliance- und Security-Awareness-Initiativen
- **Verbesserung der Reaktionsfähigkeit** auf Sicherheitsvorfälle
- **Optimierung von Sicherheitskonzepten** durch praxisnahe Testszenarien

## ✨ Features

- **Digital Twin Erstellung** - Automatische Replikation vorhandener Infrastrukturen
- **Szenario-basierte Simulationen** - Vordefinierte und anpassbare Angriffsszenarien
- **Echtzeit-Visualisierung** - Monitoring von Angriffsausbreitung und Systemreaktionen
- **Reporting-Engine** - Detaillierte Auswertungen und Handlungsempfehlungen
- **Multicloud-Support** - Unterstützung für AWS, Azure und in Zukunft GCP

## 🏗️ Technische Architektur

<div align="center">

![Angular](https://img.shields.io/badge/Frontend-Angular%2017+-DD0031?style=for-the-badge&logo=angular)
![Go](https://img.shields.io/badge/Backend-Golang-00ADD8?style=for-the-badge&logo=go)
![Kubernetes](https://img.shields.io/badge/Infrastructure-Kubernetes-326CE5?style=for-the-badge&logo=kubernetes)
![TimescaleDB](https://img.shields.io/badge/Database-TimescaleDB-blue?style=for-the-badge&logo=postgresql)

</div>

- **Frontend**: 
  - Angular 17+ mit NgRx für zustandsbasierte Simulationssteuerung
  - Material Design UI-Komponenten
  - D3.js für interaktive Visualisierungen
  - WebSockets für Echtzeit-Updates

- **Backend**: 
  - Golang für maximale Leistung und Nebenläufigkeit
  - gRPC für effiziente Kommunikation
  - Terraform für IaC (Infrastructure as Code)
  - Zero-Dependency Design für minimalen Footprint

- **Infrastruktur**: 
  - Kubernetes für isolierte Simulationsumgebungen
  - Service Mesh (Istio) für erweiterte Netzwerksimulation
  - GitOps-Workflow mit ArgoCD

- **Datenbank**: 
  - TimescaleDB für zeitbasierte Angriffsdaten
  - Redis für Cache und Pub/Sub
  - Prometheus für Metriken

## 🔧 Kernfunktionen

- **Digitaler Zwilling** deiner Infrastruktur
  - Automatische Erkennung und Replikation bestehender Ressourcen
  - Konfigurationsimport aus Terraform, CloudFormation, ARM Templates
  - Network-Policy Simulation

- **Schwachstellen-Simulation**
  - Web-Angriffe (SQLi, XSS, CSRF)
  - Netzwerk-Angriffe (Man-in-the-Middle, DDoS)
  - Cloud-spezifische Fehlkonfigurationen
  - Privilege Escalation
  - Supply Chain Attacks

- **Interaktive Lernplattform**
  - Red Team vs. Blue Team Übungen
  - Geführte Tutorials
  - Skill-basiertes Bewertungssystem
  - Gamification-Elemente

- **Cloud-Implementierungen**
  - AWS (CloudFormation/CDK)
  - Azure (ARM Templates)
  - Kubernetes-native Deployment-Optionen

## ⚙️ Projektstruktur

```
/
├── infra/               # Infrastruktur (Kubernetes Manifeste, CloudFormation, ARM)
│   ├── aws/             # AWS-spezifische Ressourcen
│   ├── azure/           # Azure-spezifische Ressourcen
│   ├── k8s/             # Kubernetes Manifeste
│   └── terraform/       # Terraform Module
│
├── backend/             # Golang Backend für Simulation und Steuerung
│   ├── cmd/             # Ausführbare Dateien
│   ├── internal/        # Private Anwendungscode
│   ├── pkg/             # Öffentlich exportierte Pakete
│   └── api/             # API Definitionen (gRPC, REST)
│
├── frontend/            # Angular Frontend für Visualisierung
│   ├── src/             # Quellcode
│   │   ├── app/         # Angular-Komponenten
│   │   ├── assets/      # Statische Dateien
│   │   └── environments/# Umgebungskonfigurationen
│   └── e2e/            # End-to-End Tests
│
├── docs/                # Dokumentationen, Diagramme, Tutorials
│   ├── architecture/    # Architekturdiagramme
│   ├── user-guides/     # Benutzerhandbücher
│   └── api/             # API-Dokumentation
│
├── scripts/             # Utility-Skripte
├── tests/               # Testsuites
├── .github/             # GitHub Actions Workflows
├── LICENSE              # Lizenzinformationen
└── README.md            # Diese Datei
```

## 🚦 Quick Start

```bash
# Repository klonen
git clone https://github.com/wastedminds1/aegis.git
cd aegis

# Dependencies installieren
make setup

# Lokale Entwicklungsumgebung starten
make dev

# Tests ausführen
make test

# Deployment für AWS
make deploy-aws

# Deployment für Azure
make deploy-azure
```

## 📅 Roadmap

| Phase | Zeitraum | Aufgaben |
|-------|----------|----------|
| **Alpha** | Woche 1 | Architekturdesign & Setup: <br>- Grundlegende Infrastruktur <br>- CI/CD-Pipeline <br>- Development Environment |
| **Beta** | Woche 2 | Backend-Entwicklung (Simulation): <br>- Core Simulation Engine <br>- API-Design <br>- Datenmodelle & Storage |
| **RC1** | Woche 3 | Frontend-Entwicklung (Visualisierung): <br>- UI-Komponenten <br>- Visualisierungsengine <br>- User Authentication |
| **Release** | Woche 4 | Integration, Deployment & Dokumentation: <br>- E2E-Tests <br>- Performance-Optimierung <br>- User-Guides |
| **Future** | Ongoing | - Multi-Cloud Support (GCP Integration) <br>- AI-assisted Remediation <br>- Erweiterte Angriffs-Szenarien |

## 📈 Besonderheiten

- **Risikofreie Umgebung** zur Analyse realer Angriffsszenarien
  - Vollständig isolierte Simulationsumgebungen
  - Read-only Integration mit Produktivsystemen

- **Echtzeit-Monitoring** von Angriffsausbreitung
  - Visuelle Darstellung von Angriffsverläufen
  - Zeitrafferfunktion für beschleunigte Analyse

- **Automatische Abhilfemaßnahmen**
  - KI-basierte Vorschläge zur Risikominimierung
  - Automatisierte Generierung von Sicherheitsrichtlinien

- **Compliance-Simulationen**
  - Vordefinierte Compliance-Checks (DSGVO, ISO27001, etc.)
  - Benutzerdefinierte Compliance-Regeln

## 🤝 Beiträge

Beiträge sind willkommen! Bitte lesen Sie [CONTRIBUTING.md](CONTRIBUTING.md) für Details zum Prozess für Pull Requests.

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.

## 📬 Kontakt

- GitHub: [@wastedminds1](https://github.com/wastedminds1)
- Project Link: [https://github.com/wastedminds1/aegis](https://github.com/wastedminds1/aegis)

---

<div align="center">
  
![Made with ❤️](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20wastedminds1-red?style=flat-square)
  
</div>
