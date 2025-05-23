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
        console.warn('Backend nicht verfügbar, verwende Mock-Daten:', error);
        return of({ status: 'mock', data: this.getMockData() });
      }),
      map((response: { status: string; data: InfrastructureData }) => response.data)
    );
  }

  getInfrastructureDetails(id: string): Observable<InfrastructureData> {
    return this.http.get<{ status: string; data: InfrastructureData }>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.warn('Backend nicht verfügbar, verwende Mock-Daten:', error);
        return of({ status: 'mock', data: this.getMockData() });
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
          console.warn('Backend nicht verfügbar, verwende Mock-Daten:', error);
          return of({ status: 'mock', data: this.getMockData() });
        }),
        map(response => response.data)
      );
  }

  private getMockData(): InfrastructureData {
    return {
      nodes: [
        {
          id: 'router-1',
          name: 'Gateway Router',
          type: 'router',
          status: 'normal',
          ipAddress: '192.168.1.1',
          metadata: {
            manufacturer: 'Cisco',
            model: 'ISR4431',
            firmware: '16.09.05',
            location: 'Hauptstandort',
          },
        },
        {
          id: 'router-2',
          name: 'Backup Router',
          type: 'router',
          status: 'warning',
          ipAddress: '192.168.1.2',
          metadata: {
            manufacturer: 'Cisco',
            model: 'ISR4321',
            firmware: '16.08.03',
            location: 'Hauptstandort',
          },
        },
        {
          id: 'server-1',
          name: 'Web Server',
          type: 'server',
          status: 'normal',
          ipAddress: '192.168.1.10',
          metadata: {
            os: 'Ubuntu 22.04',
            cpu: '8 vCPUs',
            memory: '16 GB',
            storage: '500 GB SSD',
            services: 'nginx, nodejs',
          },
        },
        {
          id: 'server-2',
          name: 'Database Server',
          type: 'server',
          status: 'warning',
          ipAddress: '192.168.1.11',
          metadata: {
            os: 'CentOS 8',
            cpu: '16 vCPUs',
            memory: '32 GB',
            storage: '2 TB SSD',
            services: 'postgresql, redis',
          },
        },
        {
          id: 'server-3',
          name: 'Mail Server',
          type: 'server',
          status: 'critical',
          ipAddress: '192.168.1.12',
          metadata: {
            os: 'Ubuntu 20.04',
            cpu: '4 vCPUs',
            memory: '8 GB',
            storage: '1 TB HDD',
            services: 'postfix, dovecot',
          },
        },
        {
          id: 'workstation-1',
          name: 'Admin Workstation',
          type: 'workstation',
          status: 'normal',
          ipAddress: '192.168.1.100',
          metadata: {
            os: 'Windows 11',
            user: 'admin',
            department: 'IT',
            location: 'Büro 1',
          },
        },
        {
          id: 'workstation-2',
          name: 'Developer Laptop',
          type: 'workstation',
          status: 'normal',
          ipAddress: '192.168.1.101',
          metadata: {
            os: 'macOS Sonoma',
            user: 'developer1',
            department: 'Entwicklung',
            location: 'Büro 2',
          },
        },
        {
          id: 'workstation-3',
          name: 'Marketing PC',
          type: 'workstation',
          status: 'warning',
          ipAddress: '192.168.1.102',
          metadata: {
            os: 'Windows 10',
            user: 'marketing1',
            department: 'Marketing',
            location: 'Büro 3',
          },
        },
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'router-1',
          target: 'server-1',
          status: 'normal',
          protocol: 'TCP',
          ports: ['80', '443', '22'],
        },
        {
          id: 'conn-2',
          source: 'router-1',
          target: 'server-2',
          status: 'normal',
          protocol: 'TCP',
          ports: ['5432', '6379', '22'],
        },
        {
          id: 'conn-3',
          source: 'router-1',
          target: 'server-3',
          status: 'warning',
          protocol: 'TCP',
          ports: ['25', '587', '993', '22'],
        },
        {
          id: 'conn-4',
          source: 'router-1',
          target: 'workstation-1',
          status: 'normal',
          protocol: 'TCP',
          ports: ['3389', '445'],
        },
        {
          id: 'conn-5',
          source: 'router-1',
          target: 'workstation-2',
          status: 'normal',
          protocol: 'TCP',
          ports: ['22', '5900'],
        },
        {
          id: 'conn-6',
          source: 'router-1',
          target: 'workstation-3',
          status: 'warning',
          protocol: 'TCP',
          ports: ['3389', '445'],
        },
        {
          id: 'conn-7',
          source: 'router-2',
          target: 'server-1',
          status: 'normal',
          protocol: 'TCP',
          ports: ['80', '443'],
        },
        {
          id: 'conn-8',
          source: 'server-1',
          target: 'server-2',
          status: 'normal',
          protocol: 'TCP',
          ports: ['5432'],
        },
        {
          id: 'conn-9',
          source: 'server-2',
          target: 'server-3',
          status: 'warning',
          protocol: 'TCP',
          ports: ['25'],
        },
      ],
    };
  }
}
