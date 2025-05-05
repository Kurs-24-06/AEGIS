import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Shared state for token refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth header for auth-related requests
  if (isAuthRequest(req)) {
    return next(req);
  }

  // Add auth token if available
  const token = authService.getToken();
  if (token) {
    req = addToken(req, token);
  }

  // Handle the response
  return next(req).pipe(
    catchError(error => {
      // Handle 401 (Unauthorized) errors
      if (error.status === 401) {
        // Prevent infinite loop if refresh token request also returns 401
        if (isAuthRequest(req)) {
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }
        return handleUnauthorized(req, next, authService, router);
      }

      // Rethrow other errors
      return throwError(() => error);
    })
  );
};

/**
 * Checks if the request is related to authentication endpoints
 * @param request HttpRequest
 * @returns boolean
 */
function isAuthRequest(request: HttpRequest<unknown>): boolean {
  return (
    request.url.includes('/auth/login') ||
    request.url.includes('/auth/register') ||
    request.url.includes('/auth/refresh')
  );
}

/**
 * Adds the Authorization header with Bearer token to the request
 * @param request HttpRequest
 * @param token string
 * @returns cloned HttpRequest with Authorization header
 */
function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Handles 401 Unauthorized errors by refreshing the token and retrying the request
 * @param request HttpRequest
 * @param next HttpHandlerFn
 * @param authService AuthService
 * @param router Router
 * @returns Observable<any>
 */
function handleUnauthorized(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<any> {
  if (isRefreshing) {
    // If refresh in progress, wait for new token and retry request
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(request, token as string)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap((token: string) => {
      isRefreshing = false;
      refreshTokenSubject.next(token);
      return next(addToken(request, token));
    }),
    catchError(error => {
      isRefreshing = false;
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => error);
    })
  );
}
