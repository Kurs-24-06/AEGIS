import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InfrastructureComponent } from './components/infrastructure/infrastructure.component';
import { SimulationsComponent } from './components/simulations/simulation.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ForbiddenComponent } from './components/auth/forbidden.components';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  // Root path redirect
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Public routes (nur für nicht eingeloggte Benutzer)
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [],
  },

  // Forbidden page (für Berechtigungsfehler)
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },

  // Protected routes (nur für eingeloggte Benutzer)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'infrastruktur', // Deutsch für "infrastructure"
    component: InfrastructureComponent,
    canActivate: [authGuard],
  },
  {
    path: 'simulationen', // Deutsch für "simulations"
    component: SimulationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'monitoring',
    component: MonitoringComponent,
    canActivate: [authGuard],
  },
  {
    path: 'berichte', // Deutsch für "reports"
    component: ReportsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'einstellungen', // Deutsch für "settings"
    component: SettingsComponent,
    canActivate: [authGuard],
  },

  // Fallback route
  { path: '**', redirectTo: '/dashboard' },
];
