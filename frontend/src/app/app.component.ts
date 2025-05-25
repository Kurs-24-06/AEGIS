// frontend/src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent, CommonModule],
  template: `
    <div class="app-container" *ngIf="showLayout; else loginTemplate">
      <app-layout></app-layout>
    </div>

    <ng-template #loginTemplate>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [
    `
      .app-container {
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AEGIS';
  showLayout = false;

  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Überwache Authentifizierung
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated: boolean) => {
        this.updateLayoutVisibility();
      }
    );

    // Überwache Router-Events - KORRIGIERT: Richtige Typisierung
    this.routerSubscription = this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLayoutVisibility();
      });

    // Initial layout visibility setzen
    this.updateLayoutVisibility();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  private updateLayoutVisibility(): void {
    const currentUrl = this.router.url;
    const isAuthRoute = currentUrl.includes('/login') || currentUrl.includes('/register');
    const isAuthenticated = this.authService.currentUserValue !== null;

    // Layout nur anzeigen wenn authentifiziert und nicht auf Auth-Seiten
    this.showLayout = isAuthenticated && !isAuthRoute;
  }
}
