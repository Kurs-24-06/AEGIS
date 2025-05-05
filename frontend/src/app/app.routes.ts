import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InfrastructureComponent } from './components/infrastructure/infrastructure.component';
import { SimulationsComponent } from './components/simulations/simulations.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'infrastruktur',
    component: InfrastructureComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'simulationen',
    component: SimulationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'monitoring',
    component: MonitoringComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'berichte',
    component: ReportsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'einstellungen',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  // Wildcard route, falls die Route nicht existiert - umleiten zur Startseite
  { path: '**', redirectTo: '' },
];
