/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export enum SimulationStatus {
  NOT_STARTED = 'not_started',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  FAILED = 'failed',
}

@Injectable({
  providedIn: 'root',
})
export class MockMonitoringService {
  private simulationStatuses = new Map<string, SimulationStatus>();

  constructor() {}

  startSimulation(simulationId: string): Observable<SimulationStatus> {
    this.simulationStatuses.set(simulationId, SimulationStatus.RUNNING);
    return of(SimulationStatus.RUNNING).pipe(delay(500));
  }

  pauseSimulation(simulationId: string): Observable<SimulationStatus> {
    if (this.simulationStatuses.get(simulationId) === 'running') {
      this.simulationStatuses.set(simulationId, SimulationStatus.PAUSED);
      return of(SimulationStatus.PAUSED).pipe(delay(500));
    } else {
      return throwError(() => new Error('Simulation not running')).pipe(delay(500));
    }
  }

  stopSimulation(simulationId: string): Observable<SimulationStatus> {
    const currentStatus = this.simulationStatuses.get(simulationId);
    if (currentStatus === 'running' || currentStatus === 'paused') {
      this.simulationStatuses.set(simulationId, SimulationStatus.STOPPED);
      return of(SimulationStatus.STOPPED).pipe(delay(500));
    } else {
      return throwError(() => new Error('Simulation not running or paused')).pipe(delay(500));
    }
  }
}
