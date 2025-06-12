import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="w-100" style="max-width: 400px;">
        <div class="card shadow">
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <h2 class="card-title h3 mb-2">Sign In</h2>
              <p class="text-muted">Welcome back to Hour Tracker</p>
            </div>

            <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('email')"
                  placeholder="Enter your email"
                />
                <div *ngIf="isFieldInvalid('email')" class="invalid-feedback">
                  <div *ngIf="signInForm.get('email')?.errors?.['required']">Email is required</div>
                  <div *ngIf="signInForm.get('email')?.errors?.['email']">Please enter a valid email address</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  formControlName="password"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('password')"
                  placeholder="Enter your password"
                />
                <div *ngIf="isFieldInvalid('password')" class="invalid-feedback">
                  <div *ngIf="signInForm.get('password')?.errors?.['required']">Password is required</div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ errorMessage }}
              </div>

              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  [disabled]="signInForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span *ngIf="isLoading">Signing in...</span>
                  <span *ngIf="!isLoading">Sign In</span>
                </button>
              </div>
            </form>

            <hr class="my-4">

            <div class="text-center">
              <small class="text-muted">
                Don't have an account?
                <a href="#" class="text-decoration-none">Contact your administrator</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SignInComponent {
  signInForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.signInForm.value;

      this.authService.signIn(email, password).subscribe({
        next: (user) => {
          this.isLoading = false;
          console.log('Sign in successful:', user);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Sign in error:', error);

          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password';
          } else {
            this.errorMessage = 'An error occurred during sign in. Please try again.';
          }
        }
      });
    }
  }
}
