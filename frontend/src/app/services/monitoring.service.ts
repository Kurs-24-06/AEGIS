import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Observable, timer, BehaviorSubject } from 'rxjs';
import { filter, throttleTime, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private performanceMetrics = new BehaviorSubject<any>({});
  private errorSubject = new BehaviorSubject<number>(0);
  private userInteractionsSubject = new BehaviorSubject<number>(0);

  public metrics$ = this.performanceMetrics.asObservable();
  public errors$ = this.errorSubject.asObservable();
  public userInteractions$ = this.userInteractionsSubject.asObservable();

  private readonly metricsEndpoint = `${environment.apiUrl}/metrics`;
  private navigationStartTime = 0;

  constructor(private http: HttpClient, private router: Router) {
    this.initRouterMonitoring();
    this.initErrorMonitoring();
    this.initPerformanceMonitoring();
    this.collectMetricsRegularly();
  }

  /**
   * Track a user interaction
   * @param action The action performed
   * @param target The target of the action
   */
  trackInteraction(action: string, target: string): void {
    const currentCount = this.userInteractionsSubject.value;
    this.userInteractionsSubject.next(currentCount + 1);

    // Send to backend for analytics
    this.sendMetric('user_interaction', { action, target });
  }

  /**
   * Log an error
   * @param error The error object
   * @param source The source of the error
   */
  logError(error: any, source: string): void {
    const currentCount = this.errorSubject.value;
    this.errorSubject.next(currentCount + 1);

    console.error(`Error in ${source}:`, error);

    // Send to backend for logging
    this.sendMetric('error', {
      message: error.message || 'Unknown error',
      stack: error.stack,
      source
    });
  }

  /**
   * Send a metric to the backend
   * @param type The metric type
   * @param data The metric data
   */
  private sendMetric(type: string, data: any): void {
    if (!environment.metrics.enabled) {
      return;
    }

    this.http.post(`${this.metricsEndpoint}/${type}`, {
      timestamp: new Date().toISOString(),
      type,
      data
    }).subscribe({
      error: err => console.error('Failed to send metric:', err)
    });
  }

  /**
   * Initialize router monitoring
   */
  private initRouterMonitoring(): void {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      const navigationTime = performance.now() - this.navigationStartTime;
      this.sendMetric('navigation', {
        path: event.url,
        navigationTime
      });

      // Reset navigation start time
      this.navigationStartTime = performance.now();
    });
  }

  /**
   * Initialize error monitoring
   */
  private initErrorMonitoring(): void {
    window.addEventListener('error', (event) => {
      this.logError(event.error || event, 'window');
    });

    window.addEventListener('unhandledrejection', (window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason || { message: 'Unhandled Promise rejection' }, 'promise');
    });
  }

  /**
   * Initialize performance monitoring
   */
  private initPerformanceMonitoring(): void {
    // Collect initial performance metrics once the page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectPerformanceMetrics();
      }, 0);
    });
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    const perfData: any = {};

    // Navigation timing
    if (window.performance && performance.timing) {
      const timing = performance.timing;
      perfData.pageLoad = timing.loadEventEnd - timing.navigationStart;
      perfData.domReady = timing.domComplete - timing.domLoading;
      perfData.networkLatency = timing.responseEnd - timing.fetchStart;
      perfData.serverTime = timing.responseEnd - timing.requestStart;
    }

    // Memory info (Chrome only)
    if (performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      perfData.totalJSHeapSize = memory.totalJSHeapSize;
      perfData.usedJSHeapSize = memory.usedJSHeapSize;
    }

    // Resource timing
    if (window.performance && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      perfData.resourceCount = resources.length;

      // Analyze resource loading
      let totalResourceTime = 0;
      let slowestResource = { name: '', duration: 0 };

      resources.forEach(resource => {
        totalResourceTime += resource.duration;
        if (resource.duration > slowestResource.duration) {
          slowestResource = {
            name: resource.name,
            duration: resource.duration
          };
        }
      });

      perfData.totalResourceTime = totalResourceTime;
      perfData.slowestResource = slowestResource;
    }

    // Update metrics
    this.performanceMetrics.next(perfData);

    // Send metrics to backend
    this.sendMetric('performance', perfData);
  }

  /**
   * Collect metrics regularly
   */
  private collectMetricsRegularly(): void {
    // Collect metrics every 60 seconds
    timer(60000, 60000).subscribe(() => {
      this.collectPerformanceMetrics();
    });
  }
 }
