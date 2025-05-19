import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

export interface User {
  id: string;
  username: string;
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private authStateKey = 'currentUser';
  private apiUrl = '/api/auth'; // Ändere dies zu deiner tatsächlichen API-URL

  // Observable für den authentifizierten Status
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadAuthStateFromStorage();
  }

  // Aktuelle User-Daten abrufen
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Initialer Ladezustand aus dem localStorage
  private loadAuthStateFromStorage(): void {
    // Nur im Browser ausführen, nicht auf dem Server
    if (isPlatformBrowser(this.platformId)) {
      try {
        const storedUser = localStorage.getItem(this.authStateKey);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        }
      } catch (error) {
        console.error('Error loading auth state from storage:', error);
        // Storage zurücksetzen bei Korruptionsproblemen
        localStorage.removeItem(this.authStateKey);
      }
    }
  }

  // Im Storage speichern
  private saveAuthStateToStorage(user: User | null): void {
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        localStorage.setItem(this.authStateKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.authStateKey);
      }
    }
  }

  // Login-Funktion
  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.saveAuthStateToStorage(user);
        }),
        catchError(error => {
          console.error('Login failed', error);
          return of(error);
        })
      );
  }

  // Logout-Funktion
  logout(): Observable<any> {
    // Optional: API-Aufruf zum Backend für Logout
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.saveAuthStateToStorage(null);
      }),
      catchError(error => {
        // Auch bei API-Fehlern lokalen State leeren
        this.currentUserSubject.next(null);
        this.saveAuthStateToStorage(null);
        return of(null);
      })
    );
  }

  // Funktion zur Token-Validierung
  validateToken(): Observable<boolean> {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return of(false);
    }

    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate-token`, { token: currentUser.token })
      .pipe(
        map(response => response.valid),
        catchError(() => {
          // Bei Fehlern ausloggen
          this.logout();
          return of(false);
        })
      );
  }

  // Für Demo-Zwecke
  mockLogin(username: string, password: string): Observable<User> {
    // Nur zum Demonstrationszweck!
    if (username === 'admin' && password === 'admin') {
      const mockUser: User = {
        id: '1',
        username: 'admin',
        token: 'mock-jwt-token',
        role: 'admin'
      };
      
      this.currentUserSubject.next(mockUser);
      this.saveAuthStateToStorage(mockUser);
      return of(mockUser);
    }
    
    // Fehlerfall
    return new Observable(observer => {
      observer.error({ message: 'Invalid username or password' });
    });
  }
}