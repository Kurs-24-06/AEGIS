// frontend/src/app/services/infrastructure.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    // In einer echten Implementierung: return this.http.get<InfrastructureData>(`${this.apiUrl}/digital-twin`);
    return of(this.getMockInfrastructureData()).pipe(
      catchError((error) => {
        console.error('Error getting infrastructure data:', error);
        return of({ nodes: [], connections: [] });
      }),
    );
  }

  importFromConfig(
    fileContent: string,
    fileType: string,
  ): Observable<InfrastructureData> {
    return this.http
      .post<InfrastructureData>(`${this.apiUrl}/import`, {
        content: fileContent,
        type: fileType,
      })
      .pipe(
        catchError((error) => {
          console.error('Error importing infrastructure:', error);
          return of({ nodes: [], connections: [] });
        }),
      );
  }

  private getMockInfrastructureData(): InfrastructureData {
    return {
      nodes: [
        {
          id: 'main-router',
          name: 'Main Router',
          type: 'router',
          status: 'normal',
          ipAddress: '10.0.0.1',
        },
        {
          id: 'db-server-01',
          name: 'DB Server 01',
          type: 'server',
          status: 'normal',
          ipAddress: '10.0.1.1',
        },
        {
          id: 'web-server-01',
          name: 'Web Server 01',
          type: 'server',
          status: 'normal',
          ipAddress: '10.0.1.2',
        },
        {
          id: 'web-server-02',
          name: 'Web Server 02',
          type: 'server',
          status: 'warning',
          ipAddress: '10.0.1.3',
        },
        {
          id: 'app-server-01',
          name: 'App Server 01',
          type: 'server',
          status: 'critical',
          ipAddress: '10.0.1.4',
        },
        {
          id: 'dev-ws-01',
          name: 'Dev WS 01',
          type: 'workstation',
          status: 'normal',
          ipAddress: '10.0.2.1',
        },
        {
          id: 'dev-ws-02',
          name: 'Dev WS 02',
          type: 'workstation',
          status: 'normal',
          ipAddress: '10.0.2.2',
        },
        {
          id: 'hr-ws-01',
          name: 'HR WS 01',
          type: 'workstation',
          status: 'warning',
          ipAddress: '10.0.2.3',
        },
        {
          id: 'marketing-ws-01',
          name: 'Marketing WS 01',
          type: 'workstation',
          status: 'normal',
          ipAddress: '10.0.2.4',
        },
        {
          id: 'dmz-router',
          name: 'DMZ Router',
          type: 'router',
          status: 'normal',
          ipAddress: '10.0.0.2',
        },
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'main-router',
          target: 'db-server-01',
          status: 'normal',
          protocol: 'TCP',
          ports: ['3306'],
        },
        {
          id: 'conn-2',
          source: 'main-router',
          target: 'app-server-01',
          status: 'warning',
          protocol: 'TCP',
          ports: ['8080', '22'],
        },
        {
          id: 'conn-3',
          source: 'main-router',
          target: 'dev-ws-01',
          status: 'normal',
          protocol: 'TCP',
          ports: ['22'],
        },
        {
          id: 'conn-4',
          source: 'main-router',
          target: 'dev-ws-02',
          status: 'normal',
          protocol: 'TCP',
          ports: ['22'],
        },
        {
          id: 'conn-5',
          source: 'main-router',
          target: 'hr-ws-01',
          status: 'critical',
          protocol: 'TCP',
          ports: ['22', '445'],
        },
        {
          id: 'conn-6',
          source: 'main-router',
          target: 'marketing-ws-01',
          status: 'normal',
          protocol: 'TCP',
          ports: ['22'],
        },
        {
          id: 'conn-7',
          source: 'main-router',
          target: 'dmz-router',
          status: 'normal',
          protocol: 'ALL',
          ports: ['*'],
        },
        {
          id: 'conn-8',
          source: 'dmz-router',
          target: 'web-server-01',
          status: 'normal',
          protocol: 'TCP',
          ports: ['80', '443'],
        },
        {
          id: 'conn-9',
          source: 'dmz-router',
          target: 'web-server-02',
          status: 'warning',
          protocol: 'TCP',
          ports: ['80', '443', '22'],
        },
        {
          id: 'conn-10',
          source: 'app-server-01',
          target: 'db-server-01',
          status: 'normal',
          protocol: 'TCP',
          ports: ['3306'],
        },
        {
          id: 'conn-11',
          source: 'web-server-01',
          target: 'app-server-01',
          status: 'normal',
          protocol: 'TCP',
          ports: ['8080'],
        },
        {
          id: 'conn-12',
          source: 'web-server-02',
          target: 'app-server-01',
          status: 'normal',
          protocol: 'TCP',
          ports: ['8080'],
        },
      ],
    };
  }
}
