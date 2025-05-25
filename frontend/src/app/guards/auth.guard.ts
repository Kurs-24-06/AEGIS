import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Weiterleiten zur Login-Seite mit der zurückführenden URL
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
    })
  );
};

// Zusätzlicher Guard für öffentliche Routen (verhindert Zugriff wenn bereits eingeloggt)
export const notAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      } else {
        // Weiterleiten zum Dashboard wenn bereits eingeloggt
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};
