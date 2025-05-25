/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { throwError } from 'rxjs';

export interface User {
  id: string;
  username: string;
  token: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  private authStateKey = 'aegis_auth_state';
  private apiUrl = '/api/auth';

  // Observable für den authentifizierten Status
  public readonly authState$ = this.authStateSubject.asObservable();
  public readonly isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  public readonly currentUser$ = this.authState$.pipe(map(state => state.user));

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // WICHTIG: Beim Start NICHT automatisch als authentifiziert setzen
    this.initializeAuthState();
  }

  // Aktuelle User-Daten abrufen
  public get currentUserValue(): User | null {
    return this.authStateSubject.value.user;
  }

  // Aktueller Auth-Status
  public get isAuthenticatedValue(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  // Initialisierung des Auth-Status beim App-Start
  private async initializeAuthState(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const storedAuth = localStorage.getItem(this.authStateKey);
      console.log('AuthService: Loaded auth state from localStorage:', storedAuth);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);

        // Check token expiry timestamp (mock)
        const tokenTimestamp = authData.timestamp ?? 0;
        const now = Date.now();
        const tokenValidDuration = 60 * 60 * 1000; // 1 hour in ms

        if (authData.token && now - tokenTimestamp < tokenValidDuration) {
          // Verwende Mock-Validierung für Demo-Zwecke
          const isValid = await this.validateTokenSync(authData.token);

          if (isValid && authData.user) {
            this.updateAuthState(true, authData.user, authData.token);
          } else {
            console.warn('AuthService: Token invalid during mock validation, clearing auth state');
            this.clearAuthState();
            localStorage.removeItem(this.authStateKey);
          }
        } else {
          console.warn('AuthService: Token expired or missing timestamp, clearing auth state');
          this.clearAuthState();
          localStorage.removeItem(this.authStateKey);
        }
      } else {
        // Keine gespeicherten Daten - nicht authentifiziert
        this.clearAuthState();
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      this.clearAuthState();
    }
  }

  // Synchrone Token-Validierung für Demo
  private validateTokenSync(token: string): boolean {
    // Für Demo-Zwecke: Mock-Token ist immer "gültig" für 1 Stunde
    if (token === 'mock-jwt-token') {
      // In einer echten App würdest du hier die Token-Expiry prüfen
      return true;
    }
    return false;
  }

  // Auth-State aktualisieren
  private updateAuthState(isAuthenticated: boolean, user: User | null, token: string | null): void {
    const newState: AuthState = {
      isAuthenticated,
      user,
      token,
    };

    this.authStateSubject.next(newState);

    // Im Storage speichern
    if (isPlatformBrowser(this.platformId)) {
      if (isAuthenticated && user && token) {
        localStorage.setItem(
          this.authStateKey,
          JSON.stringify({
            user,
            token,
            timestamp: Date.now(), // Für spätere Token-Expiry-Prüfung
          })
        );
      } else {
        localStorage.removeItem(this.authStateKey);
      }
    }
  }

  // Auth-State zurücksetzen
  private clearAuthState(): void {
    this.updateAuthState(false, null, null);
  }

  // Login-Funktion
  login(username: string, password: string): Observable<User> {
    // Demo-Login
    if (username === 'admin' && password === 'admin') {
      const mockUser: User = {
        id: '1',
        username: 'admin',
        token: 'mock-jwt-token',
        role: 'admin',
      };

      this.updateAuthState(true, mockUser, mockUser.token);
      return of(mockUser);
    }

    // API-Login (falls Backend verfügbar)
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(user => {
        this.updateAuthState(true, user, user.token);
      }),
      catchError(error => {
        console.error('Login failed', error);
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  // Logout-Funktion
  logout(): Observable<any> {
    // Lokalen State sofort leeren
    this.clearAuthState();

    // Optional: API-Aufruf zum Backend
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(error => {
        // Auch bei API-Fehlern ist lokaler Logout erfolgreich
        console.warn('Logout API call failed, but local logout successful', error);
        return of(null);
      })
    );
  }

  // Token-Validierung (für echte APIs)
  validateToken(): Observable<boolean> {
    const currentToken = this.authStateSubject.value.token;
    if (!currentToken) {
      return of(false);
    }

    // Demo: Mock-Token ist immer gültig
    if (currentToken === 'mock-jwt-token') {
      return of(true);
    }

    // Echte API-Validierung
    return this.http
      .post<{ valid: boolean }>(`${this.apiUrl}/validate-token`, { token: currentToken })
      .pipe(
        map(response => response.valid),
        catchError(() => {
          // Bei Fehlern Benutzer ausloggen
          this.clearAuthState();
          return of(false);
        })
      );
  }

  // NEUE METHODE: Force-Logout für Debugging
  forceLogout(): void {
    console.log('Force logout triggered');
    this.clearAuthState();
  }

  // NEUE METHODE: Auth-Status überprüfen (für Guards)
  checkAuthStatus(): Observable<boolean> {
    const currentState = this.authStateSubject.value;

    // Wenn bereits nicht authentifiziert, direkt false zurückgeben
    if (!currentState.isAuthenticated || !currentState.token) {
      return of(false);
    }

    // Token validieren
    return this.validateToken();
  }
}
