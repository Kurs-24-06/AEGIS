// frontend/src/app/services/monitoring.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SimulationStatus {
  id: string;
  status:
    | 'not_started'
    | 'running'
    | 'paused'
    | 'completed'
    | 'stopped'
    | 'failed';
  runtime: string;
  threatsDetected: number;
  compromisedResources: number;
  progress: number;
}

export interface SimulationEvent {
  id: string;
  timestamp: string;
  type:
    | 'discovery'
    | 'escalation'
    | 'exploitation'
    | 'lateral_movement'
    | 'data_exfiltration'
    | 'system';
  description: string;
  resourceId?: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
}

export interface AffectedResource {
  id: string;
  name: string;
  type: string;
  status: 'normal' | 'vulnerable' | 'attacked' | 'compromised';
  threatLevel: number;
  attackVector?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  private apiUrl = `${environment.apiUrl}/monitoring`;

  // Observable sources
  private simulationStatusSubject =
    new BehaviorSubject<SimulationStatus | null>(null);
  private simulationEventsSubject = new Subject<SimulationEvent>();
  private affectedResourcesSubject = new BehaviorSubject<AffectedResource[]>(
    [],
  );

  // Observable streams
  simulationStatus$ = this.simulationStatusSubject.asObservable();
  simulationEvents$ = this.simulationEventsSubject.asObservable();
  affectedResources$ = this.affectedResourcesSubject.asObservable();

  constructor(private http: HttpClient) {}

  startSimulation(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .post<SimulationStatus>(
        `${this.apiUrl}/simulations/${simulationId}/start`,
        {},
      )
      .pipe(
        catchError((error) => {
          console.error('Error starting simulation:', error);
          return of({
            id: simulationId,
            status: 'failed',
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          });
        }),
      );
  }

  pauseSimulation(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .post<SimulationStatus>(
        `${this.apiUrl}/simulations/${simulationId}/pause`,
        {},
      )
      .pipe(
        catchError((error) => {
          console.error('Error pausing simulation:', error);
          return of({
            id: simulationId,
            status: 'failed',
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          });
        }),
      );
  }

  stopSimulation(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .post<SimulationStatus>(
        `${this.apiUrl}/simulations/${simulationId}/stop`,
        {},
      )
      .pipe(
        catchError((error) => {
          console.error('Error stopping simulation:', error);
          return of({
            id: simulationId,
            status: 'failed',
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          });
        }),
      );
  }

  getAffectedResources(simulationId: string): Observable<AffectedResource[]> {
    return this.http
      .get<
        AffectedResource[]
      >(`${this.apiUrl}/simulations/${simulationId}/resources`)
      .pipe(
        catchError((error) => {
          console.error('Error getting affected resources:', error);
          return of([]);
        }),
      );
  }

  getSimulationEvents(
    simulationId: string,
    limit = 20,
  ): Observable<SimulationEvent[]> {
    return this.http
      .get<
        SimulationEvent[]
      >(`${this.apiUrl}/simulations/${simulationId}/events?limit=${limit}`)
      .pipe(
        catchError((error) => {
          console.error('Error getting simulation events:', error);
          return of([]);
        }),
      );
  }

  getSimulationStatus(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .get<SimulationStatus>(
        `${this.apiUrl}/simulations/${simulationId}/status`,
      )
      .pipe(
        catchError((error) => {
          console.error('Error getting simulation status:', error);
          return of({
            id: simulationId,
            status: 'not_started',
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          });
        }),
      );
  }

  connectToRealtimeUpdates(simulationId: string): void {
    console.log(
      `Connecting to real-time updates for simulation ${simulationId}`,
    );

    // In einer echten Implementierung wäre dies eine WebSocket-Verbindung
    const initialStatus: SimulationStatus = {
      id: simulationId,
      status: 'not_started',
      runtime: '00:00:00',
      threatsDetected: 0,
      compromisedResources: 0,
      progress: 0,
    };

    this.simulationStatusSubject.next(initialStatus);
    this.affectedResourcesSubject.next([]);
  }

  disconnectFromRealtimeUpdates(): void {
    console.log('Disconnecting from real-time updates');
    // In einer echten Implementierung würde dies die WebSocket-Verbindung schließen
  }
}
