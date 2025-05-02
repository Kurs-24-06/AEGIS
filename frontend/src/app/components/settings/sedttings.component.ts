import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SettingSection {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

interface SettingCategory {
  id: string;
  icon: string;
  title: string;
  expanded: boolean;
  sections: SettingSection[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h1>
          <i class="bi bi-gear"></i>
          Einstellungen & Verwaltung
        </h1>
      </div>

      <div class="settings-content">
        <div
          *ngFor="let category of settingCategories"
          class="settings-category"
        >
          <div class="category-header" (click)="toggleCategory(category.id)">
            <div class="category-title">
              <i class="bi" [ngClass]="category.icon"></i>
              <h2>{{ category.title }}</h2>
            </div>
            <i
              class="bi"
              [ngClass]="
                category.expanded ? 'bi-chevron-up' : 'bi-chevron-down'
              "
            ></i>
          </div>

          <div class="category-content" [class.expanded]="category.expanded">
            <div class="settings-grid">
              <div
                *ngFor="let section of category.sections"
                class="setting-section"
              >
                <div class="section-header">
                  <i class="bi" [ngClass]="section.icon"></i>
                  <div class="section-title">
                    <h3>{{ section.title }}</h3>
                    <p class="section-subtitle">{{ section.subtitle }}</p>
                  </div>
                </div>
                <p class="section-description">{{ section.description }}</p>
                <button class="config-button">Konfigurieren</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        padding: 20px;
        width: 100%;
        height: 100%;
        color: #e4e6eb;
      }

      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .settings-header h1 {
        font-size: 24px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
      }

      .settings-header i {
        color: #8b5cf6;
      }

      .settings-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .settings-category {
        background: #1e1e1e;
        border-radius: 8px;
        overflow: hidden;
      }

      .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .category-header:hover {
        background: #262626;
      }

      .category-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .category-title i {
        font-size: 20px;
        color: #3b82f6;
      }

      .category-title h2 {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
      }

      .category-header i.bi-chevron-down,
      .category-header i.bi-chevron-up {
        font-size: 16px;
        color: #a8a8a8;
      }

      .category-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
      }

      .category-content.expanded {
        max-height: 2000px; /* Large enough to show all content */
      }

      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        padding: 0 24px 24px 24px;
      }

      .setting-section {
        background: #121212;
        border-radius: 8px;
        padding: 20px;
      }

      .section-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 12px;
      }

      .section-header i {
        font-size: 20px;
        color: #a8a8a8;
        margin-top: 3px;
      }

      .section-title {
        display: flex;
        flex-direction: column;
      }

      .section-title h3 {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 4px 0;
      }

      .section-subtitle {
        font-size: 12px;
        color: #a8a8a8;
        margin: 0;
      }

      .section-description {
        color: #a8a8a8;
        font-size: 14px;
        margin: 0 0 16px 0;
      }

      .config-button {
        background: transparent;
        color: #e4e6eb;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 14px;
        cursor: pointer;
        transition:
          background-color 0.2s,
          border-color 0.2s;
      }

      .config-button:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: #666;
      }

      @media (max-width: 992px) {
        .settings-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  settingCategories: SettingCategory[] = [];

  constructor() {}

  ngOnInit(): void {
    this.settingCategories = [
      {
        id: 'management',
        icon: 'bi-people',
        title: 'Management & Administration',
        expanded: true,
        sections: [
          {
            id: 'user-management',
            icon: 'bi-person-gear',
            title: 'Benutzerverwaltung',
            subtitle: 'Rollen, SSO, MFA, Authentifikationsprotokolle',
            description:
              'Verwalten Sie Benutzerkonten, weisen Sie Rollen und Berechtigungen zu und konfigurieren Sie Sicherheitsoptionen.',
          },
          {
            id: 'project-management',
            icon: 'bi-kanban',
            title: 'Projekt- & Umgebungsmanagement',
            subtitle: 'Multi-Projekt, Isolation, Versionierung, Tagging',
            description:
              'Strukturieren Sie Ihre Arbeit in Projekten und isolierten Umgebungen (Dev, Staging, Prod).',
          },
          {
            id: 'schedule-management',
            icon: 'bi-calendar-check',
            title: 'Planung & Zeitsteuerung',
            subtitle: 'Zeitgesteuerte Läufe, Kalender, Benachrichtigungen',
            description:
              'Automatisieren Sie Simulationsläufe und verwalten Sie den Zeitplan.',
          },
          {
            id: 'activity-logging',
            icon: 'bi-activity',
            title: 'Aktivitätsprotokollierung',
            subtitle: 'Audit-Trail aller Benutzeraktionen',
            description:
              'Überwachen Sie wichtige Aktionen und Änderungen innerhalb der Plattform.',
          },
        ],
      },
      {
        id: 'cloud-integration',
        icon: 'bi-cloud',
        title: 'Cloud-Provider Integration',
        expanded: false,
        sections: [
          {
            id: 'cloud-accounts',
            icon: 'bi-cloud-arrow-up',
            title: 'Cloud Konten verwalten',
            subtitle: 'AWS, Azure, GCP, Kubernetes, Private Cloud',
            description:
              'Verbinden und konfigurieren Sie Ihre Cloud-Konten für die Infrastrukturerkennung und Simulation.',
          },
          {
            id: 'resource-discovery',
            icon: 'bi-search',
            title: 'Resource Discovery & Management',
            subtitle:
              'Discovery-Intervalle, Kosten, Compliance, Berechtigungen',
            description:
              'Verwalten Sie die erkannten Cloud-Ressourcen und deren Metadaten.',
          },
        ],
      },
      {
        id: 'security',
        icon: 'bi-shield-lock',
        title: 'Cybersecurity-Funktionen',
        expanded: false,
        sections: [
          {
            id: 'threat-intelligence',
            icon: 'bi-lightning',
            title: 'Threat Intelligence Integration',
            subtitle: 'Feeds, MITRE-ATTACK, Bedrohungsmodelle',
            description:
              'Integrieren Sie externe Threat Feeds und passen Sie Bedrohungsmodelle an.',
          },
          {
            id: 'compliance',
            icon: 'bi-check-circle',
            title: 'Compliance & Governance',
            subtitle: 'Frameworks (DSGVO, ISO), Regeln, Checks, Audit Trail',
            description:
              'Definieren, überwachen und berichten Sie Compliance-Richtlinien.',
          },
          {
            id: 'security-training',
            icon: 'bi-mortarboard',
            title: 'Security Awareness & Training',
            subtitle: 'Lernmodule, Übungen, Tutorials, Gamification',
            description:
              'Verwalten und konfigurieren Sie Trainingsinhalte und -kampagnen.',
          },
        ],
      },
      {
        id: 'collaboration',
        icon: 'bi-people',
        title: 'Kollaboration & Integration',
        expanded: false,
        sections: [
          {
            id: 'team-collaboration',
            icon: 'bi-people',
            title: 'Team-Kollaboration',
            subtitle: 'Dashboards teilen, Kommentare, Aufgaben, Chat',
            description:
              'Konfigurieren Sie Einstellungen für die Zusammenarbeit im Team.',
          },
          {
            id: 'api-integrations',
            icon: 'bi-code-slash',
            title: 'API & Integrationen',
            subtitle: 'REST API, Webhooks, SIEM, Ticketing, CI/CD',
            description:
              'Verwalten Sie API-Schlüssel und konfigurieren Sie Integrationen mit externen Systemen.',
          },
        ],
      },
      {
        id: 'analytics',
        icon: 'bi-bar-chart',
        title: 'Analytik & Lernfunktionen',
        expanded: false,
        sections: [
          {
            id: 'advanced-analytics',
            icon: 'bi-graph-up',
            title: 'Erweiterte Analysen',
            subtitle: 'Trends, Vergleiche, Prädiktion, Anomalien',
            description: 'Konfigurieren Sie Analysemodule und Schwellenwerte.',
          },
          {
            id: 'ai-functions',
            icon: 'bi-robot',
            title: 'KI-gestützte Funktionen',
            subtitle: 'Mustererkennung, Remediation, NLP, Lernmodelle',
            description:
              'Verwalten Sie Einstellungen für KI-Funktionen und trainieren Sie Modelle.',
          },
        ],
      },
      {
        id: 'platform',
        icon: 'bi-hdd-rack',
        title: 'Plattform-Infrastruktur & Sicherheit',
        expanded: false,
        sections: [
          {
            id: 'performance',
            icon: 'bi-speedometer',
            title: 'Performance-Monitoring',
            subtitle: 'Auslastung, Zustand, Skalierung, Engpässe',
            description:
              'Überwachen Sie die Systemleistung und konfigurieren Sie Metriken.',
          },
          {
            id: 'security-settings',
            icon: 'bi-shield-lock',
            title: 'Sicherheit & Datenschutz',
            subtitle: 'Verschlüsselung, Segmentierung, Maskierung, Audits',
            description:
              'Konfigurieren Sie plattformweite Sicherheits- und Datenschutzrichtlinien.',
          },
        ],
      },
    ];
  }

  toggleCategory(categoryId: string): void {
    this.settingCategories = this.settingCategories.map((category) => {
      if (category.id === categoryId) {
        return { ...category, expanded: !category.expanded };
      }
      return category;
    });
  }
}
