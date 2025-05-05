import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canLoad(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1), // Complete after first emission
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        // Redirect to login if not authenticated
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
