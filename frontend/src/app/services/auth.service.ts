import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  authState$ = this.authStateSubject.asObservable();
  user$ = this.authState$.pipe(map(state => state.user));
  isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  isLoading$ = this.authState$.pipe(map(state => state.isLoading));
  error$ = this.authState$.pipe(map(state => state.error));

  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'aegis_auth_token';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadAuthStateFromStorage();
  }

  /**
   * Load authentication state from storage on service initialization
   */
  private loadAuthStateFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);

    if (token) {
      this.validateToken(token).subscribe(
        user => {
          this.authStateSubject.next({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        },
        () => {
          // Token invalid, clear storage
          this.logout();
        }
      );
    }
  }

  /**
   * Validate token and get user info
   */
  private validateToken(token: string): Observable<User> {
    // In a real application, this would call the backend to validate the token
    // and return the current user information

    // For development purposes, we'll simulate a server response
    if (environment.production) {
      return this.http.get<User>(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      // Mock user for development
      const mockUser: User = {
        id: '1',
        username: 'admin',
        email: 'admin@aegis-security.com',
        fullName: 'System Administrator',
        role: 'admin',
        permissions: ['admin:all', 'simulation:run', 'infrastructure:manage'],
      };

      return of(mockUser);
    }
  }

  /**
   * Log in a user
   */
  login(username: string, password: string): Observable<User> {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null,
    });

    if (!environment.production) {
      // Mock login for development
      return this.mockLogin(username, password);
    }

    return this.http
      .post<{ user: User; token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          const { user, token } = response;
          // Store token in local storage
          localStorage.setItem(this.tokenKey, token);

          // Update auth state
          this.authStateSubject.next({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }),
        map(response => response.user),
        catchError(error => {
          this.authStateSubject.next({
            ...this.authStateSubject.value,
            isLoading: false,
            error: error.error?.message || 'Failed to log in',
          });
          return throwError(error);
        })
      );
  }

  /**
   * Mock login for development
   */
  private mockLogin(username: string, password: string): Observable<User> {
    return new Observable<User>(observer => {
      // Simulate network delay
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          const mockUser: User = {
            id: '1',
            username: 'admin',
            email: 'admin@aegis-security.com',
            fullName: 'System Administrator',
            role: 'admin',
            permissions: ['admin:all', 'simulation:run', 'infrastructure:manage'],
          };

          const token = 'mock-jwt-token';
          localStorage.setItem(this.tokenKey, token);

          this.authStateSubject.next({
            user: mockUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          observer.next(mockUser);
          observer.complete();
        } else {
          const errorMessage = 'Invalid username or password';

          this.authStateSubject.next({
            ...this.authStateSubject.value,
            isLoading: false,
            error: errorMessage,
          });

          observer.error(new Error(errorMessage));
        }
      }, 1000);
    });
  }

  /**
   * Log out the current user
   */
  logout(): void {
    // Clear token from storage
    localStorage.removeItem(this.tokenKey);

    // Reset auth state
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Redirect to login page
    this.router.navigate(['/login']);
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const state = this.authStateSubject.value;
    if (!state.isAuthenticated || !state.user) {
      return false;
    }
    return (
      state.user.permissions.includes(permission) || state.user.permissions.includes('admin:all')
    );
  }

  /**
   * Get the current token
   */
  getToken(): string | null {
    return this.authStateSubject.value.token || localStorage.getItem(this.tokenKey);
  }

  /**
   * Refresh the authentication token
   */
  refreshToken(): Observable<string> {
    if (!this.getToken()) {
      return throwError(() => new Error('No token to refresh'));
    }

    return this.http.post<{ token: string }>(`${this.apiUrl}/refresh`, {}).pipe(
      tap(response => {
        const newToken = response.token;
        localStorage.setItem(this.tokenKey, newToken);
        // Update auth state with new token, keep user info same
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          token: newToken,
          isAuthenticated: true,
          error: null,
        });
      }),
      map(response => response.token),
      catchError(error => {
        // On refresh failure, logout user
        this.logout();
        return throwError(() => error);
      })
    );
  }
}
