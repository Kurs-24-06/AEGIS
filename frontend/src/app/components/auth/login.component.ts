import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <div class="logo">
            <i class="bi bi-shield-lock"></i>
            <span>AEGIS</span>
          </div>
          <h2>Log In</h2>
          <p>Adaptive Environment for Guided Intrusion Simulation</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="form-control"
              placeholder="Enter your username"
            />
            <div *ngIf="submitted && f['username'].errors" class="error-message">
              <div *ngIf="f['username'].errors?.['required']">Username is required</div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                formControlName="password"
                class="form-control"
                placeholder="Enter your password"
              />
              <button type="button" class="toggle-password" (click)="togglePasswordVisibility()">
                <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
            <div *ngIf="submitted && f['password'].errors" class="error-message">
              <div *ngIf="f['password'].errors?.['required']">Password is required</div>
            </div>
          </div>

          <div class="form-group remember-me">
            <div>
              <input type="checkbox" id="remember" formControlName="rememberMe" />
              <label for="remember">Remember me</label>
            </div>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <div *ngIf="error" class="error-message global-error">
            {{ error }}
          </div>

          <div class="form-group">
            <button type="submit" class="login-button" [disabled]="loading">
              <span *ngIf="!loading">Log In</span>
              <i *ngIf="loading" class="bi bi-arrow-repeat spinning"></i>
            </button>
          </div>
        </form>

        <div class="login-footer">
          <p>For demonstration purposes, use:</p>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> admin</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #0f1117;
        background-image:
          radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
      }

      .login-card {
        width: 400px;
        background-color: #1a1a1a;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        padding: 30px;
        animation: fadeIn 0.5s ease-in-out;
      }

      .card-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .logo {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        font-size: 28px;
        font-weight: 600;
      }

      .logo i {
        color: #3b82f6;
        font-size: 32px;
      }

      h2 {
        font-size: 24px;
        margin-bottom: 10px;
        color: #e4e6eb;
      }

      .card-header p {
        color: #a8a8a8;
        font-size: 14px;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      label {
        font-size: 14px;
        color: #e4e6eb;
        font-weight: 500;
      }

      .form-control {
        background-color: #121212;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 12px 16px;
        color: #e4e6eb;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .form-control:focus {
        border-color: #3b82f6;
        outline: none;
      }

      .password-input {
        position: relative;
      }

      .toggle-password {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #a8a8a8;
        cursor: pointer;
        font-size: 16px;
      }

      .remember-me {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: #a8a8a8;
      }

      .remember-me div {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .remember-me input[type='checkbox'] {
        accent-color: #3b82f6;
      }

      .forgot-password {
        color: #3b82f6;
        text-decoration: none;
      }

      .login-button {
        width: 100%;
        padding: 12px;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .login-button:hover {
        background-color: #2563eb;
      }

      .login-button:disabled {
        background-color: #3b82f6;
        opacity: 0.7;
        cursor: not-allowed;
      }

      .error-message {
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
      }

      .global-error {
        background-color: rgba(239, 68, 68, 0.1);
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      .login-footer {
        margin-top: 30px;
        text-align: center;
        border-top: 1px solid #333;
        padding-top: 20px;
        font-size: 14px;
        color: #a8a8a8;
      }

      .login-footer p {
        margin: 5px 0;
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

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPassword = false;
  returnUrl = '/';
  private authSubscription?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Check if already logged in
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated: boolean) => {
        if (isAuthenticated) {
          this.router.navigate([this.returnUrl]);
        }
      }
    );
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.f['username'].value, this.f['password'].value).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error: unknown) => {
        if (error && typeof error === 'object' && 'message' in error) {
          this.error = (error as { message?: string }).message || 'Invalid username or password';
        } else {
          this.error = 'Invalid username or password';
        }
        this.loading = false;
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}
