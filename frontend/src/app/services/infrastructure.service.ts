// frontend/src/app/services/infrastructure.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface InfrastructureNode {
  id: string;
  name: string;
  type: 'router' | 'server' | 'workstation';
  status: 'normal' | 'warning' | 'critical';
  ipAddress?: string;
  metadata?: Record<string, string>;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  status: 'normal' | 'warning' | 'critical';
  protocol?: string;
  ports?: string[];
}

export interface InfrastructureData {
  nodes: InfrastructureNode[];
  connections: Connection[];
}

@Injectable({
  providedIn: 'root',
})
export class InfrastructureService {
  private apiUrl = `${environment.apiUrl}/infrastructure`;

  constructor(private http: HttpClient) {}

  getInfrastructureData(): Observable<InfrastructureData> {
    return this.http.get<{ status: string; data: InfrastructureData }>(`${this.apiUrl}`).pipe(
      catchError(error => {
        console.error('Error getting infrastructure data:', error);
        return of({ status: 'error', data: { nodes: [], connections: [] } });
      }),
      map((response: { status: string; data: InfrastructureData }) => response.data)
    );
  }

  getInfrastructureDetails(id: string): Observable<InfrastructureData> {
    return this.http.get<{ status: string; data: InfrastructureData }>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error getting infrastructure details for ${id}:`, error);
        return of({ status: 'error', data: { nodes: [], connections: [] } });
      }),
      map(response => response.data)
    );
  }

  importFromConfig(fileContent: string, fileType: string): Observable<InfrastructureData> {
    return this.http
      .post<{ status: string; data: InfrastructureData }>(`${this.apiUrl}/import`, {
        content: fileContent,
        type: fileType,
      })
      .pipe(
        catchError(error => {
          console.error('Error importing infrastructure:', error);
          return of({ status: 'error', data: { nodes: [], connections: [] } });
        }),
        map(response => response.data)
      );
  }
}
