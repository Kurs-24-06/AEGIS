import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="forbidden-container">
      <div class="forbidden-content">
        <div class="forbidden-icon">
          <i class="bi bi-shield-lock"></i>
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this resource.</p>
        <div class="actions">
          <a routerLink="/" class="btn-primary">Back to Dashboard</a>
          <button class="btn-secondary" (click)="goBack()">Go Back</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .forbidden-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #121212;
      }

      .forbidden-content {
        text-align: center;
        padding: 40px;
        background-color: #1a1a1a;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        max-width: 500px;
        width: 100%;
        animation: fadeIn 0.5s ease-in-out;
      }

      .forbidden-icon {
        font-size: 80px;
        color: #ef4444;
        margin-bottom: 20px;
      }

      h1 {
        font-size: 28px;
        color: #e4e6eb;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: #a8a8a8;
        margin-bottom: 30px;
      }

      .actions {
        display: flex;
        justify-content: center;
        gap: 16px;
      }

      .btn-primary {
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        text-decoration: none;
      }

      .btn-primary:hover {
        background-color: #2563eb;
      }

      .btn-secondary {
        background-color: transparent;
        color: #e4e6eb;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .btn-secondary:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ForbiddenComponent {
  constructor() {}

  goBack(): void {
    window.history.back();
  }
}
