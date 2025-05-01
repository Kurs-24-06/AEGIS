import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SystemMetric {
  name: string;
  value: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  metrics: SystemMetric[];
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  private apiUrl = `${environment.apiBaseUrl}/monitoring`;
  private cachedStatus: SystemStatus | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Get the current system status with metrics
   */
  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.apiUrl}/status`).pipe(
      tap((status) => {
        this.cachedStatus = status;
      }),
      catchError((error) => {
        console.error('Error fetching system status:', error);

        // If we have cached data, return that instead of failing
        if (this.cachedStatus) {
          return of({
            ...this.cachedStatus,
            overall: 'degraded', // Mark as degraded since we couldn't refresh
          });
        }

        // Otherwise create a fallback status
        return of(this.createFallbackStatus());
      }),
    );
  }

  /**
   * Get a specific metric's history
   */
  getMetricHistory(
    metricName: string,
    timeRange: 'hour' | 'day' | 'week',
  ): Observable<SystemMetric[]> {
    return this.http
      .get<
        SystemMetric[]
      >(`${this.apiUrl}/metrics/${metricName}/history?timeRange=${timeRange}`)
      .pipe(
        catchError((error) => {
          console.error(
            `Error fetching metric history for ${metricName}:`,
            error,
          );
          return throwError(
            () => new Error(`Failed to load history for ${metricName}`),
          );
        }),
      );
  }

  /**
   * Get all available metrics names
   */
  getAvailableMetrics(): Observable<string[]> {
    return this.http.get<{ metrics: string[] }>(`${this.apiUrl}/metrics`).pipe(
      map((response) => response.metrics),
      catchError((error) => {
        console.error('Error fetching available metrics:', error);
        return throwError(() => new Error('Failed to load available metrics'));
      }),
    );
  }

  /**
   * Create a fallback status in case of API failure
   */
  private createFallbackStatus(): SystemStatus {
    return {
      overall: 'degraded',
      metrics: [
        {
          name: 'API Connection',
          value: 0,
          timestamp: new Date().toISOString(),
          status: 'critical',
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }
}
