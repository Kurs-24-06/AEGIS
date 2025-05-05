// frontend/src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SystemStatus {
  component: string;
  status: 'normal' | 'warning' | 'critical';
  message: string;
}

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  route: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>
          <i class="bi bi-speedometer2"></i>
          AEGIS Dashboard
        </h1>
        <p class="dashboard-subtitle">Security Simulation Platform</p>
      </div>

      <div class="dashboard-grid">
        <!-- System Status -->
        <div class="dashboard-card status-card">
          <div class="card-header">
            <h2>
              <i class="bi bi-activity"></i>
              System Status
            </h2>
          </div>
          <div class="card-content">
            <div *ngFor="let status of systemStatus" class="status-item">
              <div class="status-item-header">
                <span class="status-label">{{ status.component }}</span>
                <span
                  class="status-indicator"
                  [ngClass]="'status-' + status.status"
                >
                  <i
                    class="bi"
                    [ngClass]="
                      status.status === 'normal'
                        ? 'bi-check-circle-fill'
                        : status.status === 'warning'
                        ? 'bi-exclamation-triangle-fill'
                        : 'bi-x-circle-fill'
                    "
                  ></i>
                  {{ status.status | titlecase }}
                </span>
              </div>
              <p class="status-message">{{ status.message }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-card quick-actions-card">
          <div class="card-header">
            <h2>
              <i class="bi bi-lightning-charge"></i>
              Quick Actions
            </h2>
          </div>
          <div class="card-content">
            <div class="quick-actions-grid">

                *ngFor="let action of quickActions"
                [routerLink]="action.route"
                class="quick-action-item"
              >
                <div class="quick-action-icon">
                  <i class="bi" [ngClass]="action.icon"></i>
                </div>
                <div class="quick-action-content">
                  <h3>{{ action.label }}</h3>
                  <p>{{ action.description }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="dashboard-card activity-card">
          <div class="card-header">
            <h2>
              <i class="bi bi-clock-history"></i>
              Recent Activity
            </h2>
          </div>
          <div class="card-content">
            <div *ngFor="let activity of recentActivity" class="activity-item">
              <div class="activity-icon" [ngClass]="'activity-' + activity.status">
                <i
                  class="bi"
                  [ngClass]="
                    activity.type === 'simulation'
                      ? 'bi-play-circle'
                      : activity.type === 'infrastructure'
                      ? 'bi-hdd-rack'
                      : activity.type === 'report'
                      ? 'bi-file-earmark-text'
                      : 'bi-gear'
                  "
                ></i>
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <span class="activity-description">{{ activity.description }}</span>
                  <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                </div>
                <div class="activity-status" [ngClass]="'status-' + activity.status">
                  <i
                    class="bi"
                    [ngClass]="
                      activity.status === 'info'
                        ? 'bi-info-circle'
                        : activity.status === 'success'
                        ? 'bi-check-circle'
                        : activity.status === 'warning'
                        ? 'bi-exclamation-triangle'
                        : 'bi-x-circle'
                    "
                  ></i>
                  {{ activity.status | titlecase }}
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <a routerLink="/activity" class="view-all-link">
              View All Activity
              <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>

        <!-- Statistics Summary -->
        <div class="dashboard-card stats-card">
          <div class="card-header">
            <h2>
              <i class="bi bi-bar-chart"></i>
              Statistics
            </h2>
          </div>
          <div class="card-content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">12</div>
                <div class="stat-label">Active Simulations</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">45</div>
                <div class="stat-label">Infrastructure Models</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">132</div>
                <div class="stat-label">Detected Vulnerabilities</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">78%</div>
                <div class="stat-label">Success Rate</div>
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
        height: 100%;
        overflow-y: auto;
      }

      .dashboard-header {
        margin-bottom: 24px;
      }

      .dashboard-header h1 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        font-size: 24px;
        font-weight: 600;
      }

      .dashboard-header h1 i {
        color: #3b82f6;
      }

      .dashboard-subtitle {
        color: #a8a8a8;
        font-size: 14px;
        margin: 0;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }

      .dashboard-card {
        background-color: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        padding: 16px;
        border-bottom: 1px solid #333;
      }

      .card-header h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .card-header h2 i {
        color: #3b82f6;
      }

      .card-content {
        padding: 16px;
      }

      .card-footer {
        padding: 12px 16px;
        border-top: 1px solid #333;
        text-align: center;
      }

      /* System Status */
      .status-item {
        padding: 12px 0;
        border-bottom: 1px solid #333;
      }

      .status-item:last-child {
        border-bottom: none;
      }

      .status-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .status-label {
        font-weight: 500;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }

      .status-normal {
        color: #10b981;
        background-color: rgba(16, 185, 129, 0.1);
      }

      .status-warning {
        color: #f59e0b;
        background-color: rgba(245, 158, 11, 0.1);
      }

      .status-critical {
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
      }

      .status-message {
        color: #a8a8a8;
        font-size: 13px;
        margin: 0;
      }

      /* Quick Actions */
      .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 16px;
      }

      .quick-action-item {
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: #262626;
        border-radius: 8px;
        color: #e4e6eb;
        text-decoration: none;
        transition: background-color 0.2s;
      }

      .quick-action-item:hover {
        background-color: #333;
      }

      .quick-action-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: #3b82f6;
        border-radius: 8px;
        margin-right: 16px;
      }

      .quick-action-icon i {
        font-size: 20px;
        color: #fff;
      }

      .quick-action-content h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 500;
      }

      .quick-action-content p {
        margin: 0;
        color: #a8a8a8;
        font-size: 13px;
      }

      /* Recent Activity */
      .activity-item {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px solid #333;
      }

      .activity-item:last-child {
        border-bottom: none;
      }

      .activity-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 16px;
      }

      .activity-info {
        background-color: rgba(59, 130, 246, 0.1);
      }

      .activity-success {
        background-color: rgba(16, 185, 129, 0.1);
      }

      .activity-warning {
        background-color: rgba(245, 158, 11, 0.1);
      }

      .activity-danger {
        background-color: rgba(239, 68, 68, 0.1);
      }

      .activity-icon i {
        font-size: 16px;
      }

      .activity-content {
        flex: 1;
      }

      .activity-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .activity-description {
        font-weight: 500;
      }

      .activity-time {
        color: #a8a8a8;
        font-size: 12px;
      }

      .activity-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
      }

      .status-info {
        color: #3b82f6;
      }

      .status-success {
        color: #10b981;
      }

      .status-warning {
        color: #f59e0b;
      }

      .status-danger {
        color: #ef4444;
      }

      .view-all-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #3b82f6;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: color 0.2s;
      }

      .view-all-link:hover {
        color: #60a5fa;
      }

      /* Statistics */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background-color: #262626;
        border-radius: 8px;
        text-align: center;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .stat-label {
        color: #a8a8a8;
        font-size: 13px;
      }

      /* Responsive */
      @media (max-width: 992px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  systemStatus: SystemStatus[] = [];
  quickActions: QuickAction[] = [];
  recentActivity: RecentActivity[] = [];

  constructor() {
    // This empty constructor is intentionally kept for DI to work properly
  }

  ngOnInit(): void {
    // Initialize mock data
    this.initializeData();
  }

  initializeData(): void {
    // System status
    this.systemStatus = [
      {
        component: 'Backend API',
        status: 'normal',
        message: 'All services operational',
      },
      {
        component: 'Database',
        status: 'normal',
        message: 'Connected and responsive',
      },
      {
        component: 'Simulation Engine',
        status: 'warning',
        message: 'High load detected, performance may be affected',
      },
      {
        component: 'Storage',
        status: 'normal',
        message: '64% capacity utilized',
      },
    ];

    // Quick actions
    this.quickActions = [
      {
        icon: 'bi-play-circle',
        label: 'Start New Simulation',
        description: 'Create and run a new attack simulation',
        route: '/simulationen',
      },
      {
        icon: 'bi-hdd-rack',
        label: 'Manage Infrastructure',
        description: 'Create or modify infrastructure models',
        route: '/infrastruktur',
      },
      {
        icon: 'bi-file-earmark-text',
        label: 'Generate Report',
        description: 'Create security assessment reports',
        route: '/berichte',
      },
      {
        icon: 'bi-gear',
        label: 'Configure Settings',
        description: 'Adjust system and user preferences',
        route: '/einstellungen',
      },
    ];

    // Recent activity
    this.recentActivity = [
      {
        id: 'act-1',
        type: 'simulation',
        description: 'Simulation "Cloud Pentest" completed',
        timestamp: new Date(new Date().getTime() - 30 * 60000).toISOString(),
        status: 'success',
      },
      {
        id: 'act-2',
        type: 'infrastructure',
        description: 'Infrastructure "AWS Prod" modified',
        timestamp: new Date(new Date().getTime() - 2 * 3600000).toISOString(),
        status: 'info',
      },
      {
        id: 'act-3',
        type: 'simulation',
        description: 'Simulation "DDoS Defense" failed',
        timestamp: new Date(new Date().getTime() - 5 * 3600000).toISOString(),
        status: 'danger',
      },
      {
        id: 'act-4',
        type: 'report',
        description: 'Security report generated',
        timestamp: new Date(new Date().getTime() - 1 * 86400000).toISOString(),
        status: 'info',
      },
    ];
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  }
}
