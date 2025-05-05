// frontend/src/app/services/monitoring.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject, Subscription, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SimulationStatus {
  id: string;
  status: 'not_started' | 'running' | 'paused' | 'completed' | 'stopped' | 'failed';
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
export class MonitoringService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/monitoring`;

  // Observable sources
  private simulationStatusSubject = new BehaviorSubject<SimulationStatus | null>(null);
  private simulationEventsSubject = new Subject<SimulationEvent>();
  private affectedResourcesSubject = new BehaviorSubject<AffectedResource[]>([]);

  // Observable streams
  simulationStatus$ = this.simulationStatusSubject.asObservable();
  simulationEvents$ = this.simulationEventsSubject.asObservable();
  affectedResources$ = this.affectedResourcesSubject.asObservable();

  private realtimeSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {}

  startSimulation(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .post<SimulationStatus>(`${this.apiUrl}/simulations/${simulationId}/start`, {})
      .pipe(
        catchError(error => {
          console.error('Error starting simulation:', error);
          return of({
            id: simulationId,
            status: 'failed' as const,
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          } as SimulationStatus);
        })
      );
  }

  pauseSimulation(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .post<SimulationStatus>(`${this.apiUrl}/simulations/${simulationId}/pause`, {})
      .pipe(
        catchError(error => {
          console.error('Error pausing simulation:', error);
          return of({
            id: simulationId,
            status: 'failed' as const,
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          } as SimulationStatus);
        })
      );
  }

  stopSimulation(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .post<SimulationStatus>(`${this.apiUrl}/simulations/${simulationId}/stop`, {})
      .pipe(
        catchError(error => {
          console.error('Error stopping simulation:', error);
          return of({
            id: simulationId,
            status: 'failed' as const,
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          } as SimulationStatus);
        })
      );
  }

  getAffectedResources(simulationId: string): Observable<AffectedResource[]> {
    return this.http
      .get<AffectedResource[]>(`${this.apiUrl}/simulations/${simulationId}/resources`)
      .pipe(
        catchError(error => {
          console.error('Error getting affected resources:', error);
          return of([]);
        })
      );
  }

  getSimulationEvents(simulationId: string, limit = 20): Observable<SimulationEvent[]> {
    return this.http
      .get<SimulationEvent[]>(`${this.apiUrl}/simulations/${simulationId}/events?limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('Error getting simulation events:', error);
          return of([]);
        })
      );
  }

  getSimulationStatus(simulationId: string): Observable<SimulationStatus> {
    return this.http
      .get<SimulationStatus>(`${this.apiUrl}/simulations/${simulationId}/status`)
      .pipe(
        catchError(error => {
          console.error('Error getting simulation status:', error);
          return of({
            id: simulationId,
            status: 'not_started' as const,
            runtime: '00:00:00',
            threatsDetected: 0,
            compromisedResources: 0,
            progress: 0,
          } as SimulationStatus);
        })
      );
  }

  connectToRealtimeUpdates(simulationId: string): void {
    console.log(`Connecting to real-time updates for simulation ${simulationId}`);

    // Unsubscribe if already connected
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }

    // Simulate real-time updates by polling every 5 seconds
    this.realtimeSubscription = timer(0, 5000)
      .pipe(switchMap(() => this.getSimulationStatus(simulationId)))
      .subscribe(status => {
        this.simulationStatusSubject.next(status);
      });

    // Initialize affected resources and events
    this.getAffectedResources(simulationId).subscribe(resources => {
      this.affectedResourcesSubject.next(resources);
    });

    this.getSimulationEvents(simulationId).subscribe(events => {
      events.forEach(event => this.simulationEventsSubject.next(event));
    });
  }

  disconnectFromRealtimeUpdates(): void {
    console.log('Disconnecting from real-time updates');
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnectFromRealtimeUpdates();
  }
}
