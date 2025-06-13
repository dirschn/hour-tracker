import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthenticatedUser } from '../../generated-api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-vh-100 bg-light">
      <!-- Main Content -->
      <div class="container-fluid py-4">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">Dashboard</h1>
            <p class="text-muted mb-0">Welcome back, {{ currentUser?.first_name }}!</p>
          </div>
          <div class="text-end">
            <small class="text-muted">{{ getCurrentDate() }}</small>
          </div>
        </div>

        <!-- Dashboard Cards -->
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          <div class="col">
            <div class="card border-0 shadow-sm h-100 dashboard-card" (click)="navigateTo('/companies')">
              <div class="card-body text-center p-4">
                <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                  <i class="bi bi-building fs-3 text-primary"></i>
                </div>
                <h5 class="card-title mb-2">Companies</h5>
                <p class="card-text text-muted">Manage your companies and clients</p>
                <div class="mt-auto">
                  <span class="btn btn-outline-primary btn-sm">View Companies</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col">
            <div class="card border-0 shadow-sm h-100 dashboard-card" (click)="navigateTo('/positions')">
              <div class="card-body text-center p-4">
                <div class="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                  <i class="bi bi-briefcase fs-3 text-success"></i>
                </div>
                <h5 class="card-title mb-2">Positions</h5>
                <p class="card-text text-muted">Manage job positions and roles</p>
                <div class="mt-auto">
                  <span class="btn btn-outline-success btn-sm">View Positions</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col">
            <div class="card border-0 shadow-sm h-100 dashboard-card">
              <div class="card-body text-center p-4">
                <div class="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                  <i class="bi bi-clock-history fs-3 text-warning"></i>
                </div>
                <h5 class="card-title mb-2">Shifts</h5>
                <p class="card-text text-muted">Track and manage your time</p>
                <div class="mt-auto">
                  <span class="btn btn-outline-warning btn-sm">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col">
            <div class="card border-0 shadow-sm h-100 dashboard-card">
              <div class="card-body text-center p-4">
                <div class="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                  <i class="bi bi-graph-up fs-3 text-info"></i>
                </div>
                <h5 class="card-title mb-2">Reports</h5>
                <p class="card-text text-muted">View analytics and reports</p>
                <div class="mt-auto">
                  <span class="btn btn-outline-info btn-sm">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card border-0 shadow-sm mt-5">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="row row-cols-auto g-3">
              <div class="col">
                <button class="btn btn-primary" (click)="navigateTo('/companies/new')">
                  <i class="bi bi-plus-circle me-2"></i>Add Company
                </button>
              </div>
              <div class="col">
                <button class="btn btn-success" (click)="navigateTo('/positions/new')">
                  <i class="bi bi-plus-circle me-2"></i>Add Position
                </button>
              </div>
              <div class="col">
                <button class="btn btn-info" (click)="navigateTo('/users/new')">
                  <i class="bi bi-plus-circle me-2"></i>Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-card {
      cursor: pointer;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .dashboard-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }
  `]
})
export class DashboardComponent {
  currentUser: AuthenticatedUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/sign-in']);
      },
      error: (error) => {
        console.error('Sign out error:', error);
        // Still navigate to sign-in even if API call fails
        this.router.navigate(['/sign-in']);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getCurrentDate(): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date());
  }
}
