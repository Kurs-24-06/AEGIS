import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type SimulationStatus =
  | 'not_started'
  | 'running'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'failed';

export interface SimulationItem {
  id: string;
  name: string;
  description: string;
  status: SimulationStatus;
  target: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  progress: number;
  type: 'penetration' | 'compliance' | 'vulnerability';
  findings?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private apiBase = '/api';

  constructor(private http: HttpClient) {}

  getSimulations(): Observable<SimulationItem[]> {
    return this.http.get<SimulationItem[]>(`${this.apiBase}/simulations`);
  }

  getSimulationStatus(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/monitoring/simulations/${id}/status`);
  }

  startSimulation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/simulations/${id}/start`, {});
  }

  pauseSimulation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/simulations/${id}/pause`, {});
  }

  stopSimulation(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/simulations/${id}/stop`, {});
  }
}
