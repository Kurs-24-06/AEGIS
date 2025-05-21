import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InfrastructureComponent } from './components/infrastructure/infrastructure.component';
import { SimulationsComponent } from './components/simulations/simulation.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  // Root path redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'infrastructure',
    component: InfrastructureComponent,
    canActivate: [authGuard],
  },
  {
    path: 'simulations',
    component: SimulationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'monitoring',
    component: MonitoringComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard],
  },
  // Wildcard route redirects to dashboard
  { path: '**', redirectTo: 'dashboard' },
];
