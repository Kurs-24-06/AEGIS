import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        // Redirect to login page if not authenticated
        return this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: this.router.url },
        });
      })
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: any): Observable<boolean | UrlTree> {
    return this.checkPermission(route?.data?.permission);
  }

  canActivateChild(route: any): Observable<boolean | UrlTree> {
    return this.checkPermission(route?.data?.permission);
  }

  canLoad(route: any): Observable<boolean | UrlTree> {
    return this.checkPermission(route?.data?.permission);
  }

  private checkPermission(permission: string | string[]): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        }

        // Check permission
        if (typeof permission === 'string') {
          // Single permission check
          if (this.authService.hasPermission(permission)) {
            return true;
          }
        } else if (Array.isArray(permission)) {
          // Multiple permissions check (requires all)
          if (permission.every(p => this.authService.hasPermission(p))) {
            return true;
          }
        } else {
          // No permission required
          return true;
        }

        // Redirect to forbidden page if permission check fails
        return this.router.createUrlTree(['/forbidden']);
      })
    );
  }
}
