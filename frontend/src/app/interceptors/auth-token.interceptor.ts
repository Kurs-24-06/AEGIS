import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip if request is not to our API
    if (!request.url.startsWith(environment.apiUrl)) {
      return next.handle(request);
    }

    // Get current auth state
    const authState = this.authService['authStateSubject'].value;

    // Add auth token if available
    if (authState.isAuthenticated && authState.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
    }

    return next.handle(request);
  }
}
