import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  routerLink: string;
  status?: 'normal' | 'warning' | 'critical';
  count?: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  status?: 'normal' | 'warning' | 'critical';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Übersicht</h1>
        <div class="header-actions">
          <button class="refresh-button">
            <i class="bi bi-arrow-clockwise"></i>
            Aktualisieren
          </button>
          <div class="date-selector">
            <i class="bi bi-calendar3"></i>
            <span>Letzte 30 Tage</span>
            <i class="bi bi-chevron-down"></i>
          </div>
        </div>
      </header>

      <div class="metrics-row">
        <div
          *ngFor="let metric of metrics"
          class="metric-card"
          [ngClass]="{
            'status-warning': metric.status === 'warning',
            'status-critical': metric.status === 'critical',
          }"
        >
          <div class="metric-icon">
            <i class="bi" [ngClass]="metric.icon"></i>
          </div>
          <div class="metric-content">
            <h3>{{ metric.title }}</h3>
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-change" *ngIf="metric.change">
              <i
                class="bi"
                [ngClass]="{
                  'bi-arrow-up-short': metric.change.isPositive,
                  'bi-arrow-down-short': !metric.change.isPositive,
                }"
              ></i>
              <span
                [ngClass]="{
                  positive: metric.change.isPositive,
                  negative: !metric.change.isPositive,
                }"
              >
                {{ metric.change.value }}%
              </span>
              <span class="period">vs. Vormonat</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cards-container">
        <div
          *ngFor="let card of cards"
          class="dashboard-card"
          [ngClass]="{
            'status-warning': card.status === 'warning',
            'status-critical': card.status === 'critical',
          }"
          [routerLink]="card.routerLink"
        >
          <div class="card-header">
            <div class="card-icon">
              <i class="bi" [ngClass]="card.icon"></i>
            </div>
            <div class="card-count" *ngIf="card.count !== undefined">
              {{ card.count }}
            </div>
          </div>
          <div class="card-content">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
          </div>
          <div class="card-footer">
            <span>Details anzeigen</span>
            <i class="bi bi-arrow-right"></i>
          </div>
        </div>
      </div>

      <div class="activity-section">
        <div class="section-header">
          <h2>Letzte Aktivitäten</h2>
          <a href="#" class="view-all">Alle anzeigen</a>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">
              <i class="bi bi-shield-fill-exclamation"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">
                <strong>Simulation "AWS-Infrastruktur" gestartet</strong>
                <span class="activity-time">Vor 20 Minuten</span>
              </div>
              <p>Die Simulation zur Überprüfung der AWS-Infrastruktur wurde gestartet.</p>
              <div class="activity-tags">
                <span class="tag">Simulation</span>
                <span class="tag">AWS</span>
              </div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">
              <i class="bi bi-exclamation-triangle-fill text-warning"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">
                <strong>Schwachstelle in S3-Bucket-Konfiguration gefunden</strong>
                <span class="activity-time">Vor 45 Minuten</span>
              </div>
              <p>
                In der "AWS-Infrastruktur"-Simulation wurde eine potenziell unsichere
                S3-Bucket-Konfiguration entdeckt.
              </p>
              <div class="activity-tags">
                <span class="tag">Schwachstelle</span>
                <span class="tag tag-warning">Mittel</span>
              </div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">
              <i class="bi bi-person-fill-check"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">
                <strong>Benutzer "admin" hat sich angemeldet</strong>
                <span class="activity-time">Vor 1 Stunde</span>
              </div>
              <p>Benutzer "admin" hat sich von IP-Adresse 192.168.1.1 angemeldet.</p>
              <div class="activity-tags">
                <span class="tag">Authentifizierung</span>
                <span class="tag">Benutzer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 24px;
        color: #e4e6eb;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .dashboard-header h1 {
        font-size: 28px;
        font-weight: 500;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 16px;
      }

      .refresh-button {
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

      .refresh-button:hover {
        background-color: #2563eb;
      }

      .date-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #333;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
      }

      .metrics-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .metric-card {
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.2s;
      }

      .metric-card:hover {
        transform: translateY(-2px);
      }

      .metric-icon {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .metric-content {
        flex: 1;
      }

      .metric-content h3 {
        font-size: 14px;
        font-weight: 500;
        color: #a8a8a8;
        margin: 0 0 4px 0;
      }

      .metric-value {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .metric-change {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
      }

      .metric-change .positive {
        color: #10b981; /* Green */
      }

      .metric-change .negative {
        color: #ef4444; /* Red */
      }

      .metric-change .period {
        color: #a8a8a8;
      }

      .metric-card.status-warning .metric-icon {
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }

      .metric-card.status-critical .metric-icon {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .cards-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .dashboard-card {
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition:
          transform 0.2s,
          background-color 0.2s;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .dashboard-card:hover {
        transform: translateY(-2px);
        background-color: #262626;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .card-icon {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .card-count {
        font-size: 18px;
        font-weight: 600;
        background-color: #333;
        border-radius: 16px;
        padding: 4px 12px;
      }

      .card-content {
        flex: 1;
      }

      .card-content h3 {
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 8px 0;
      }

      .card-content p {
        font-size: 14px;
        color: #a8a8a8;
        margin: 0;
        line-height: 1.5;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #333;
        font-size: 14px;
        color: #3b82f6;
      }

      .dashboard-card.status-warning .card-icon {
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }

      .dashboard-card.status-critical .card-icon {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .activity-section {
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 20px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .section-header h2 {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
      }

      .view-all {
        color: #3b82f6;
        text-decoration: none;
        font-size: 14px;
      }

      .view-all:hover {
        text-decoration: underline;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .activity-item {
        display: flex;
        gap: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #333;
      }

      .activity-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .activity-icon {
        background-color: #262626;
        color: #3b82f6;
        width: 36px;
        height: 36px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }

      .activity-icon .text-warning {
        color: #f59e0b;
      }

      .activity-content {
        flex: 1;
      }

      .activity-title {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 4px;
      }

      .activity-time {
        font-size: 12px;
        color: #a8a8a8;
      }

      .activity-content p {
        font-size: 14px;
        color: #a8a8a8;
        margin: 0 0 8px 0;
        line-height: 1.5;
      }

      .activity-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tag {
        background-color: #262626;
        color: #e4e6eb;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .tag-warning {
        background-color: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .metrics-row {
          grid-template-columns: 1fr;
        }

        .cards-container {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  metrics: MetricCard[] = [
    {
      title: 'Aktive Simulationen',
      value: 3,
      icon: 'bi-play-circle-fill',
      change: {
        value: 25,
        isPositive: true,
      },
    },
    {
      title: 'Erkannte Schwachstellen',
      value: 12,
      icon: 'bi-shield-fill-exclamation',
      change: {
        value: 8,
        isPositive: false,
      },
      status: 'warning',
    },
    {
      title: 'Gesicherte Ressourcen',
      value: '86%',
      icon: 'bi-shield-fill-check',
      change: {
        value: 12,
        isPositive: true,
      },
    },
    {
      title: 'Durchschnittlicher Risk Score',
      value: 42,
      icon: 'bi-graph-up',
      change: {
        value: 15,
        isPositive: true,
      },
    },
  ];

  cards: DashboardCard[] = [
    {
      title: 'Infrastrukturübersicht',
      description: 'Übersicht der erkannten Infrastruktur und Ressourcen.',
      icon: 'bi-hdd-network-fill',
      routerLink: '/infrastruktur',
      count: 42,
    },
    {
      title: 'Aktive Simulationen',
      description: 'Laufende und geplante Simulationen und Tests.',
      icon: 'bi-play-circle-fill',
      routerLink: '/simulationen',
      count: 3,
    },
    {
      title: 'Bedrohungsanalyse',
      description: 'Analyse potenzieller Bedrohungen und Schwachstellen.',
      icon: 'bi-shield-fill-exclamation',
      routerLink: '/monitoring',
      count: 12,
      status: 'warning',
    },
    {
      title: 'Compliance-Status',
      description: 'Status der Einhaltung von Sicherheitsstandards.',
      icon: 'bi-check-circle-fill',
      routerLink: '/berichte',
      count: 4,
    },
    {
      title: 'Ausstehende Aufgaben',
      description: 'Offene Sicherheitsaufgaben und Empfehlungen.',
      icon: 'bi-list-check',
      routerLink: '/aufgaben',
      count: 8,
      status: 'critical',
    },
    {
      title: 'Einstellungen',
      description: 'Konfiguration und Anpassung der Plattform.',
      icon: 'bi-gear-fill',
      routerLink: '/einstellungen',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    // Hier könnten wir Daten vom Backend laden
  }
}
