// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InfrastructureComponent } from './components/infrastructure/infrastructure.component';
import { SimulationsComponent } from './components/simulations/simulations.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'infrastruktur', component: InfrastructureComponent },
  { path: 'simulationen', component: SimulationsComponent },
  { path: 'monitoring', component: MonitoringComponent },
  { path: '**', redirectTo: '' },
];
