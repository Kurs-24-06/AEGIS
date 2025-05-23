// frontend/src/app/components/layout/layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <a routerLink="/dashboard" class="logo">
            <i class="bi bi-shield-lock"></i>
            <span>AEGIS</span>
          </a>
        </div>

        <nav class="sidebar-nav">
          <ul>
            <li *ngFor="let item of navItems">
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
                class="nav-item"
                (click)="onNavClick(item.path)"
              >
                <i class="bi" [ngClass]="item.icon"></i>
                <span>{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background-color: #121212;
      }

      .sidebar {
        width: 240px;
        height: 100%;
        background-color: #1a1a1a;
        border-right: 1px solid #333;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }

      .sidebar-header {
        padding: 16px;
        border-bottom: 1px solid #333;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #e4e6eb;
        text-decoration: none;
        font-size: 20px;
        font-weight: 600;
      }

      .logo i {
        font-size: 24px;
        color: #3b82f6;
      }

      .sidebar-nav {
        flex-grow: 1;
        overflow-y: auto;
        padding: 16px 0;
      }

      .sidebar-nav ul {
        margin: 0;
        padding: 0;
        list-style-type: none;
      }

      .nav-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        color: #a8a8a8;
        text-decoration: none;
        transition:
          background-color 0.2s,
          color 0.2s;
        position: relative;
        cursor: pointer;
      }

      .nav-item i {
        font-size: 18px;
        margin-right: 12px;
      }

      .nav-item:hover {
        background-color: #262626;
        color: #e4e6eb;
      }

      .nav-item.active {
        color: #e4e6eb;
        background-color: #262626;
        border-left: 3px solid #3b82f6;
        padding-left: 13px; /* 16px - 3px border */
      }

      .main-content {
        flex-grow: 1;
        overflow-y: auto;
        height: 100%;
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 60px;
        }

        .sidebar .logo span,
        .sidebar .nav-item span {
          display: none;
        }

        .sidebar .nav-item {
          justify-content: center;
          padding: 12px;
        }

        .sidebar .nav-item i:first-child {
          margin-right: 0;
        }

        .sidebar .nav-item.active {
          padding-left: 9px; /* 12px - 3px border */
        }
      }
    `,
  ],
})
export class LayoutComponent {
  navItems = [
    {
      path: '/dashboard',
      icon: 'bi-grid-1x2-fill',
      label: 'Dashboard',
    },
    {
      path: '/infrastruktur',
      icon: 'bi-hdd-rack-fill',
      label: 'Infrastruktur',
    },
    {
      path: '/simulationen',
      icon: 'bi-activity',
      label: 'Simulationen',
    },
    {
      path: '/monitoring',
      icon: 'bi-graph-up',
      label: 'Monitoring',
    },
    {
      path: '/berichte',
      icon: 'bi-file-earmark-text',
      label: 'Berichte',
    },
    {
      path: '/einstellungen',
      icon: 'bi-gear',
      label: 'Einstellungen',
    },
  ];

  onNavClick(path: string): void {
    console.log('Navigation clicked:', path);
  }
}
