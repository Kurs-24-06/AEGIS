import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InfrastructureComponent } from './components/infrastructure/infrastructure.component';
import { SimulationsComponent } from './components/simulations/simulations.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'infrastruktur', component: InfrastructureComponent },
  { path: 'simulationen', component: SimulationsComponent },
  { path: 'monitoring', component: MonitoringComponent },
  { path: 'berichte', component: ReportsComponent },
  { path: 'einstellungen', component: SettingsComponent },
  { path: '**', redirectTo: '' },
];
