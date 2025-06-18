import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfilesService, ProfileResponse } from '../../generated-api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Profile</h1>
          </div>

          <div *ngIf="profileData; else loading">
            <!-- User Information Card -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-person-circle me-2"></i>
                  Personal Information
                </h5>
                <button type="button" class="btn btn-primary btn-sm" (click)="editProfile()">
                  <i class="bi bi-pencil me-2"></i>Edit
                </button>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label text-muted">Full Name</label>
                      <div class="fw-medium">{{ profileData.user.first_name }} {{ profileData.user.last_name }}</div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label text-muted">Username</label>
                      <div class="fw-medium">{{ profileData.user.username }}</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label text-muted">Email</label>
                      <div class="fw-medium">{{ profileData.user.email }}</div>
                    </div>
                    <div class="mb-3" *ngIf="profileData.user.created_at">
                      <label class="form-label text-muted">Member Since</label>
                      <div class="fw-medium">{{ profileData.user.created_at | date:'longDate' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Employments Section -->
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-briefcase me-2"></i>
                  Employments ({{ profileData.user.employments.length }})
                </h5>
                <button type="button" class="btn btn-primary btn-sm" (click)="addEmployment()">
                  <i class="bi bi-plus-lg me-2"></i>New Employment
                </button>
              </div>
              <div class="card-body">
                <div *ngIf="profileData.user.employments.length > 0; else noEmployments">
                  <div class="row">
                    <div class="col-lg-6 mb-4" *ngFor="let employment of profileData.user.employments">
                      <div class="card h-100 border-start border-4"
                           [class.border-success]="isActiveEmployment(employment)"
                           [class.border-secondary]="!isActiveEmployment(employment)">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-start mb-3">
                            <h6 class="card-title mb-0">{{ employment.position.title }}</h6>
                            <div class="d-flex gap-2 align-items-center">
                              <span class="badge"
                                    [class.bg-success]="isActiveEmployment(employment)"
                                    [class.bg-secondary]="!isActiveEmployment(employment)">
                                {{ isActiveEmployment(employment) ? 'Active' : 'Ended' }}
                              </span>
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-secondary"
                                (click)="editEmployment(employment.id)"
                                title="Edit Employment">
                                <i class="bi bi-pencil"></i>
                              </button>
                            </div>
                          </div>

                          <div class="mb-2" title="Company">
                            <i class="bi bi-building me-2 text-muted"></i>
                            <strong>{{ employment.company.name }}</strong>
                          </div>

                          <div class="mb-2" *ngIf="employment.company.description" title="Company Description">
                            <i class="bi bi-info-circle me-2 text-muted"></i>
                            <span>{{ employment.company.description }}</span>
                          </div>

                          <div class="mb-2">
                            <i class="bi bi-calendar-event me-2 text-muted"></i>
                            <span>Started: {{ employment.start_date | date:'mediumDate' }}</span>
                          </div>

                          <div *ngIf="employment.end_date" class="mb-2">
                            <i class="bi bi-calendar-x me-2 text-muted"></i>
                            <span>Ended: {{ employment.end_date | date:'mediumDate' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <ng-template #noEmployments>
                  <div class="text-center text-muted py-4">
                    <i class="bi bi-briefcase display-6 mb-3"></i>
                    <p class="mb-3">No employments found</p>
                    <button class="btn btn-primary" (click)="addEmployment()">
                      <i class="bi bi-plus-lg me-2"></i>
                      Add Your First Employment
                    </button>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>

          <ng-template #loading>
            <div class="d-flex justify-content-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading profile...</span>
              </div>
            </div>
          </ng-template>

          <div *ngIf="errorMessage" class="alert alert-danger mt-4">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileData: ProfileResponse | null = null;
  errorMessage: string | null = null;
  loading = true;

  constructor(
    private profilesService: ProfilesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = null;

    this.profilesService.profileGet().subscribe({
      next: (data) => {
        this.profileData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.errorMessage = error?.error?.error || 'Failed to load profile data';
        this.loading = false;
      }
    });
  }

  isActiveEmployment(employment: any): boolean {
    return !employment.end_date;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  editProfile(): void {
    // Logic to navigate to the edit profile page
    this.router.navigate(['/profile/edit']);
  }

  addEmployment(): void {
    this.router.navigate(['/employments/new']);
  }

  editEmployment(employmentId: number): void {
    this.router.navigate(['/employments', employmentId, 'edit']);
  }
}
