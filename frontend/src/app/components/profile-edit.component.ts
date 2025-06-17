import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfilesService, ProfileResponse, ProfileUpdateRequest } from '../../generated-api';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Edit Profile</h1>
            <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
              <i class="bi bi-arrow-left me-2"></i>Back to Profile
            </button>
          </div>

          <div *ngIf="loading" class="d-flex justify-content-center py-5">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading profile...</span>
            </div>
          </div>

          <div *ngIf="!loading">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-person-gear me-2"></i>
                  Personal Information
                </h5>
              </div>
              <div class="card-body">
                <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="first_name" class="form-label">First Name *</label>
                        <input
                          type="text"
                          id="first_name"
                          class="form-control"
                          formControlName="first_name"
                          [class.is-invalid]="isFieldInvalid('first_name')"
                          placeholder="Enter your first name"
                        >
                        <div class="invalid-feedback" *ngIf="isFieldInvalid('first_name')">
                          <div *ngIf="profileForm.get('first_name')?.errors?.['required']">
                            First name is required
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="last_name" class="form-label">Last Name *</label>
                        <input
                          type="text"
                          id="last_name"
                          class="form-control"
                          formControlName="last_name"
                          [class.is-invalid]="isFieldInvalid('last_name')"
                          placeholder="Enter your last name"
                        >
                        <div class="invalid-feedback" *ngIf="isFieldInvalid('last_name')">
                          <div *ngIf="profileForm.get('last_name')?.errors?.['required']">
                            Last name is required
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="username" class="form-label">Username *</label>
                    <input
                      type="text"
                      id="username"
                      class="form-control"
                      formControlName="username"
                      [class.is-invalid]="isFieldInvalid('username')"
                      placeholder="Enter your username"
                    >
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('username')">
                      <div *ngIf="profileForm.get('username')?.errors?.['required']">
                        Username is required
                      </div>
                      <div *ngIf="profileForm.get('username')?.errors?.['minlength']">
                        Username must be at least 3 characters long
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label for="email" class="form-label">Email *</label>
                    <input
                      type="email"
                      id="email"
                      class="form-control"
                      formControlName="email"
                      [class.is-invalid]="isFieldInvalid('email')"
                      placeholder="Enter your email"
                    >
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                      <div *ngIf="profileForm.get('email')?.errors?.['required']">
                        Email is required
                      </div>
                      <div *ngIf="profileForm.get('email')?.errors?.['email']">
                        Please enter a valid email address
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      (click)="goBack()"
                      [disabled]="saving"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="profileForm.invalid || saving"
                    >
                      <span *ngIf="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      <i *ngIf="!saving" class="bi bi-check-lg me-2"></i>
                      {{ saving ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="alert alert-success mt-4 alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" (click)="clearMessages()"></button>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="alert alert-danger mt-4 alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" (click)="clearMessages()"></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  saving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private profilesService: ProfilesService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.clearMessages();

    this.profilesService.profileGet().subscribe({
      next: (data: ProfileResponse) => {
        this.profileForm.patchValue({
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          username: data.user.username,
          email: data.user.email
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.errorMessage = error?.error?.error || 'Failed to load profile data';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.saving = true;
      this.clearMessages();

      const updateRequest: ProfileUpdateRequest = {
        profile: this.profileForm.value
      };

      this.profilesService.profilePatch(updateRequest).subscribe({
        next: (response) => {
          this.saving = false;
          this.successMessage = 'Profile updated successfully!';

          // Redirect back to profile view immediately
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.saving = false;

          if (error?.error?.error && Array.isArray(error.error.error)) {
            this.errorMessage = error.error.error.join(', ');
          } else {
            this.errorMessage = error?.error?.error || 'Failed to update profile';
          }
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
