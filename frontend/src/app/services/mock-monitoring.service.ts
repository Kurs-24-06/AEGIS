import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export type SimulationStatus =
  | 'not_started'
  | 'running'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'failed';

@Injectable({
  providedIn: 'root',
})
export class MockMonitoringService {
  private simulationStatuses = new Map<string, SimulationStatus>();

  constructor() {}

  startSimulation(simulationId: string): Observable<SimulationStatus> {
    this.simulationStatuses.set(simulationId, 'running');
    return of('running').pipe(delay(500));
  }

  pauseSimulation(simulationId: string): Observable<SimulationStatus> {
    if (this.simulationStatuses.get(simulationId) === 'running') {
      this.simulationStatuses.set(simulationId, 'paused');
      return of('paused').pipe(delay(500));
    } else {
      return throwError(() => new Error('Simulation not running')).pipe(delay(500));
    }
  }

  stopSimulation(simulationId: string): Observable<SimulationStatus> {
    const currentStatus = this.simulationStatuses.get(simulationId);
    if (currentStatus === 'running' || currentStatus === 'paused') {
      this.simulationStatuses.set(simulationId, 'stopped');
      return of('stopped').pipe(delay(500));
    } else {
      return throwError(() => new Error('Simulation not running or paused')).pipe(delay(500));
    }
  }
}
