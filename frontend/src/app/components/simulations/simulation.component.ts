import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockMonitoringService, SimulationStatus } from '../../services/mock-monitoring.service';

interface SimulationItem {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'running' | 'paused' | 'completed' | 'stopped' | 'failed';
  target: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  progress: number;
  type: 'penetration' | 'compliance' | 'vulnerability';
  findings?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

@Component({
  selector: 'app-simulations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="simulations-container">
      <header class="simulations-header">
        <h1>Simulationen</h1>
        <div class="header-actions">
          <div class="search-container">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Suche nach Simulationen..." />
          </div>
          <select class="filter-selector">
            <option>Alle Status</option>
            <option>Aktiv</option>
            <option>Abgeschlossen</option>
            <option>Fehlgeschlagen</option>
          </select>
          <button class="new-simulation-button">
            <i class="bi bi-plus-lg"></i>
            Neue Simulation
          </button>
        </div>
      </header>

      <div class="content-container">
        <div class="tabs">
          <button class="tab-button active">Alle Simulationen</button>
          <button class="tab-button">Penetrationstests</button>
          <button class="tab-button">Compliance-Checks</button>
          <button class="tab-button">Schwachstellen-Scans</button>
        </div>

        <div class="active-simulations" *ngIf="hasActiveSimulations()">
          <h2>Aktive Simulationen</h2>

          <div class="simulations-grid">
            <div class="simulation-card" *ngFor="let simulation of getActiveSimulations()">
              <div class="simulation-header">
                <span class="simulation-badge" [ngClass]="'badge-' + simulation.type">{{
                  getSimulationTypeLabel(simulation.type)
                }}</span>
                <div class="simulation-status" [ngClass]="'status-' + simulation.status">
                  <i class="bi" [ngClass]="getStatusIcon(simulation.status)"></i>
                  {{ getStatusLabel(simulation.status) }}
                </div>
              </div>

              <h3 class="simulation-title">{{ simulation.name }}</h3>
              <p class="simulation-description">{{ simulation.description }}</p>

              <div class="simulation-meta">
                <div class="meta-item">
                  <i class="bi bi-hdd-rack"></i>
                  <span>{{ simulation.target }}</span>
                </div>
                <div class="meta-item">
                  <i class="bi bi-clock"></i>
                  <span>{{ simulation.duration || 'Noch nicht gestartet' }}</span>
                </div>
              </div>

              <div class="simulation-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="simulation.progress"></div>
                </div>
                <span class="progress-text">{{ simulation.progress }}%</span>
              </div>

              <div class="simulation-actions">
                <button
                  *ngIf="simulation.status === 'not_started'"
                  (click)="startSimulation(simulation.id)"
                  class="action-button start"
                >
                  <i class="bi bi-play-fill"></i>
                  Starten
                </button>
                <button
                  *ngIf="simulation.status === 'running'"
                  (click)="pauseSimulation(simulation.id)"
                  class="action-button pause"
                >
                  <i class="bi bi-pause-fill"></i>
                  Pausieren
                </button>
                <button
                  *ngIf="simulation.status === 'paused'"
                  (click)="resumeSimulation(simulation.id)"
                  class="action-button resume"
                >
                  <i class="bi bi-play-fill"></i>
                  Fortsetzen
                </button>
                <button
                  *ngIf="simulation.status === 'running' || simulation.status === 'paused'"
                  (click)="stopSimulation(simulation.id)"
                  class="action-button stop"
                >
                  <i class="bi bi-stop-fill"></i>
                  Stoppen
                </button>
                <button class="action-button details">
                  <i class="bi bi-eye"></i>
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="completed-simulations">
          <h2>Abgeschlossene Simulationen</h2>

          <div class="simulations-table-container">
            <table class="simulations-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Typ</th>
                  <th>Ziel</th>
                  <th>Status</th>
                  <th>Fortschritt</th>
                  <th>Datum</th>
                  <th>Ergebnisse</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let simulation of getCompletedSimulations()">
                  <td>{{ simulation.name }}</td>
                  <td>
                    <span class="simulation-badge" [ngClass]="'badge-' + simulation.type">{{
                      getSimulationTypeLabel(simulation.type)
                    }}</span>
                  </td>
                  <td>{{ simulation.target }}</td>
                  <td>
                    <div class="simulation-status" [ngClass]="'status-' + simulation.status">
                      <i class="bi" [ngClass]="getStatusIcon(simulation.status)"></i>
                      {{ getStatusLabel(simulation.status) }}
                    </div>
                  </td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="simulation.progress"></div>
                    </div>
                  </td>
                  <td>{{ simulation.endTime }}</td>
                  <td>
                    <div class="findings-summary" *ngIf="simulation.findings">
                      <span class="finding-badge critical">{{ simulation.findings.critical }}</span>
                      <span class="finding-badge high">{{ simulation.findings.high }}</span>
                      <span class="finding-badge medium">{{ simulation.findings.medium }}</span>
                      <span class="finding-badge low">{{ simulation.findings.low }}</span>
                      <span class="finding-badge info">{{ simulation.findings.info }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="icon-button">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="icon-button">
                        <i class="bi bi-file-earmark-text"></i>
                      </button>
                      <button class="icon-button">
                        <i class="bi bi-arrow-repeat"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination">
            <button class="pagination-button">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="pagination-number active">1</button>
            <button class="pagination-number">2</button>
            <button class="pagination-number">3</button>
            <button class="pagination-button">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .simulations-container {
        padding: 24px;
        color: #e4e6eb;
      }

      .simulations-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .simulations-header h1 {
        font-size: 28px;
        font-weight: 500;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .search-container {
        position: relative;
      }

      .search-container i {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #a8a8a8;
      }

      .search-container input {
        padding: 8px 8px 8px 32px;
        background-color: #333;
        border: 1px solid #555;
        border-radius: 4px;
        color: #e4e6eb;
        font-size: 14px;
        outline: none;
        width: 250px;
      }

      .filter-selector {
        padding: 8px 12px;
        background-color: #333;
        border: 1px solid #555;
        border-radius: 4px;
        color: #e4e6eb;
        font-size: 14px;
        outline: none;
      }

      .new-simulation-button {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .new-simulation-button:hover {
        background-color: #2563eb;
      }

      .content-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .tabs {
        display: flex;
        border-bottom: 1px solid #333;
        margin-bottom: 16px;
      }

      .tab-button {
        padding: 12px 16px;
        background-color: transparent;
        border: none;
        color: #a8a8a8;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
      }

      .tab-button:hover {
        color: #e4e6eb;
      }

      .tab-button.active {
        color: #3b82f6;
      }

      .tab-button.active::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background-color: #3b82f6;
      }

      .active-simulations,
      .completed-simulations {
        margin-bottom: 32px;
      }

      .active-simulations h2,
      .completed-simulations h2 {
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 16px 0;
      }

      .simulations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 16px;
      }

      .simulation-card {
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .simulation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .simulation-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }

      .badge-penetration {
        background-color: rgba(168, 85, 247, 0.2);
        color: #a855f7;
      }

      .badge-compliance {
        background-color: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
      }

      .badge-vulnerability {
        background-color: rgba(234, 88, 12, 0.2);
        color: #ea580c;
      }

      .simulation-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
      }

      .status-not_started {
        color: #a8a8a8;
      }

      .status-running {
        color: #3b82f6;
      }

      .status-paused {
        color: #f59e0b;
      }

      .status-completed {
        color: #10b981;
      }

      .status-stopped {
        color: #a8a8a8;
      }

      .status-failed {
        color: #ef4444;
      }

      .simulation-title {
        font-size: 16px;
        font-weight: 500;
        margin: 0;
      }

      .simulation-description {
        font-size: 14px;
        color: #a8a8a8;
        margin: 0;
        line-height: 1.5;
      }

      .simulation-meta {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .meta-item i {
        color: #a8a8a8;
      }

      .simulation-progress {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .progress-bar {
        flex: 1;
        height: 6px;
        background-color: #333;
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background-color: #3b82f6;
        border-radius: 3px;
      }

      .progress-text {
        font-size: 14px;
        font-weight: 500;
        min-width: 40px;
        text-align: right;
      }

      .simulation-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
        flex: 1;
      }

      .action-button.start {
        background-color: #3b82f6;
        color: white;
        border: none;
      }

      .action-button.start:hover {
        background-color: #2563eb;
      }

      .action-button.pause {
        background-color: #f59e0b;
        color: white;
        border: none;
      }

      .action-button.pause:hover {
        background-color: #d97706;
      }

      .action-button.resume {
        background-color: #3b82f6;
        color: white;
        border: none;
      }

      .action-button.resume:hover {
        background-color: #2563eb;
      }

      .action-button.stop {
        background-color: #ef4444;
        color: white;
        border: none;
      }

      .action-button.stop:hover {
        background-color: #dc2626;
      }

      .action-button.details {
        background-color: #333;
        color: #e4e6eb;
        border: 1px solid #555;
      }

      .action-button.details:hover {
        background-color: #444;
      }

      .simulations-table-container {
        overflow-x: auto;
      }

      .simulations-table {
        width: 100%;
        border-collapse: collapse;
      }

      .simulations-table th,
      .simulations-table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #333;
      }

      .simulations-table th {
        font-weight: 500;
        color: #a8a8a8;
        font-size: 14px;
      }

      .simulations-table td {
        font-size: 14px;
      }

      .findings-summary {
        display: flex;
        gap: 4px;
      }

      .finding-badge {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
      }

      .finding-badge.critical {
        background-color: #ef4444;
        color: white;
      }

      .finding-badge.high {
        background-color: #f59e0b;
        color: white;
      }

      .finding-badge.medium {
        background-color: #eab308;
        color: white;
      }

      .finding-badge.low {
        background-color: #10b981;
        color: white;
      }

      .finding-badge.info {
        background-color: #3b82f6;
        color: white;
      }

      .table-actions {
        display: flex;
        gap: 4px;
      }

      .icon-button {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        background-color: #333;
        border: 1px solid #555;
        color: #e4e6eb;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .icon-button:hover {
        background-color: #444;
      }

      .pagination {
        display: flex;
        justify-content: center;
        gap: 4px;
        margin-top: 16px;
      }

      .pagination-button,
      .pagination-number {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        background-color: #333;
        border: 1px solid #555;
        color: #e4e6eb;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .pagination-button:hover,
      .pagination-number:hover {
        background-color: #444;
      }

      .pagination-number.active {
        background-color: #3b82f6;
        border-color: #3b82f6;
      }

      @media (max-width: 768px) {
        .simulations-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .header-actions {
          flex-wrap: wrap;
          width: 100%;
        }

        .simulations-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SimulationsComponent {
  simulations: SimulationItem[] = [
    {
      id: '1',
      name: 'AWS-Infrastruktur Penetrationstest',
      description:
        'Umfassender Penetrationstest der AWS-Infrastruktur mit Fokus auf S3-Buckets und EC2-Instanzen.',
      status: 'running',
      target: 'AWS-Infrastruktur',
      startTime: '2023-05-01T10:00:00',
      duration: '00:45:21',
      progress: 45,
      type: 'penetration',
    },
    {
      id: '2',
      name: 'Azure Active Directory Compliance-Check',
      description:
        'Überprüfung der Azure AD-Konfiguration auf Einhaltung der internen Sicherheitsrichtlinien.',
      status: 'not_started',
      target: 'Azure Active Directory',
      progress: 0,
      type: 'compliance',
    },
    {
      id: '3',
      name: 'Kubernetes-Cluster Schwachstellenscan',
      description:
        'Scan des Kubernetes-Clusters auf bekannte Schwachstellen und Fehlkonfigurationen.',
      status: 'paused',
      target: 'Kubernetes-Cluster',
      startTime: '2023-05-02T14:30:00',
      duration: '00:15:45',
      progress: 30,
      type: 'vulnerability',
    },
    {
      id: '4',
      name: 'Web-Anwendungen Penetrationstest',
      description:
        'Sicherheitstest der öffentlich zugänglichen Web-Anwendungen auf OWASP Top 10 Schwachstellen.',
      status: 'completed',
      target: 'Web-Anwendungen',
      startTime: '2023-04-28T09:00:00',
      endTime: '2023-04-28T16:45:00',
      duration: '07:45:00',
      progress: 100,
      type: 'penetration',
      findings: {
        critical: 2,
        high: 5,
        medium: 8,
        low: 12,
        info: 7,
      },
    },
    {
      id: '5',
      name: 'Netzwerksicherheit Compliance-Check',
      description: 'Überprüfung der Netzwerkkonfiguration auf Einhaltung von ISO 27001.',
      status: 'completed',
      target: 'Unternehmensnetzwerk',
      startTime: '2023-04-25T10:30:00',
      endTime: '2023-04-25T15:15:00',
      duration: '04:45:00',
      progress: 100,
      type: 'compliance',
      findings: {
        critical: 0,
        high: 3,
        medium: 6,
        low: 9,
        info: 5,
      },
    },
    {
      id: '6',
      name: 'Endpunktgeräte Schwachstellenscan',
      description:
        'Scan der Mitarbeiter-Laptops und -Desktops auf Schwachstellen und veraltete Software.',
      status: 'failed',
      target: 'Endpunktgeräte',
      startTime: '2023-04-20T08:00:00',
      endTime: '2023-04-20T08:45:00',
      duration: '00:45:00',
      progress: 35,
      type: 'vulnerability',
      findings: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    },
  ];

  constructor(private monitoringService: MockMonitoringService) {}

  hasActiveSimulations(): boolean {
    return this.simulations.some(
      sim => sim.status === 'running' || sim.status === 'paused' || sim.status === 'not_started'
    );
  }

  getActiveSimulations(): SimulationItem[] {
    return this.simulations.filter(
      sim => sim.status === 'running' || sim.status === 'paused' || sim.status === 'not_started'
    );
  }

  getCompletedSimulations(): SimulationItem[] {
    return this.simulations.filter(
      sim => sim.status === 'completed' || sim.status === 'stopped' || sim.status === 'failed'
    );
  }

  getSimulationTypeLabel(type: string): string {
    switch (type) {
      case 'penetration':
        return 'Penetrationstest';
      case 'compliance':
        return 'Compliance-Check';
      case 'vulnerability':
        return 'Schwachstellenscan';
      default:
        return type;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'not_started':
        return 'Nicht gestartet';
      case 'running':
        return 'Läuft';
      case 'paused':
        return 'Pausiert';
      case 'completed':
        return 'Abgeschlossen';
      case 'stopped':
        return 'Gestoppt';
      case 'failed':
        return 'Fehlgeschlagen';
      default:
        return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'not_started':
        return 'bi-circle';
      case 'running':
        return 'bi-play-fill';
      case 'paused':
        return 'bi-pause-fill';
      case 'completed':
        return 'bi-check-circle-fill';
      case 'stopped':
        return 'bi-stop-fill';
      case 'failed':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle';
    }
  }

  startSimulation(simulationId: string): void {
    const simulation = this.simulations.find(sim => sim.id === simulationId);
    if (simulation && simulation.status === 'not_started') {
      simulation.status = 'running';
      simulation.startTime = new Date().toISOString();

      // In einer echten Anwendung würden wir hier den Monitoring-Service aufrufen
      this.monitoringService.startSimulation(simulationId).subscribe({
        next: (status: SimulationStatus) => {
          console.log('Simulation started:', status);
        },
        error: error => {
          console.error('Failed to start simulation:', error);
          simulation.status = 'not_started';
        },
      });
    }
  }

  pauseSimulation(simulationId: string): void {
    const simulation = this.simulations.find(sim => sim.id === simulationId);
    if (simulation && simulation.status === 'running') {
      simulation.status = 'paused';

      // In einer echten Anwendung würden wir hier den Monitoring-Service aufrufen
      this.monitoringService.pauseSimulation(simulationId).subscribe({
        next: (status: SimulationStatus) => {
          console.log('Simulation paused:', status);
        },
        error: error => {
          console.error('Failed to pause simulation:', error);
          simulation.status = 'running';
        },
      });
    }
  }

  resumeSimulation(simulationId: string): void {
    const simulation = this.simulations.find(sim => sim.id === simulationId);
    if (simulation && simulation.status === 'paused') {
      simulation.status = 'running';

      // In einer echten Anwendung würden wir hier den Monitoring-Service aufrufen
      this.monitoringService.startSimulation(simulationId).subscribe({
        next: (status: SimulationStatus) => {
          console.log('Simulation resumed:', status);
        },
        error: error => {
          console.error('Failed to resume simulation:', error);
          simulation.status = 'paused';
        },
      });
    }
  }

  stopSimulation(simulationId: string): void {
    const simulation = this.simulations.find(sim => sim.id === simulationId);
    if (simulation && (simulation.status === 'running' || simulation.status === 'paused')) {
      simulation.status = 'stopped';
      simulation.endTime = new Date().toISOString();

      // In einer echten Anwendung würden wir hier den Monitoring-Service aufrufen
      this.monitoringService.stopSimulation(simulationId).subscribe({
        next: (status: SimulationStatus) => {
          console.log('Simulation stopped:', status);
        },
        error: error => {
          console.error('Failed to stop simulation:', error);
          simulation.status = 'running';
        },
      });
    }
  }
}
