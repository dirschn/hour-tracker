import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../../generated-api';
import { AuthenticatedUser } from '../../generated-api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <h1 class="h3 mb-3">Dashboard</h1>
      <div *ngIf="dashboardData; else loading">
        <div class="mb-4">
          <div class="card text-center bg-light mb-3">
            <div class="card-body">
              <h5 class="card-title">Total Weekly Hours</h5>
              <span class="display-4 fw-bold">{{ dashboardData.total_weekly_hours }}</span>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <h5>Active Employments</h5>
          <div class="row g-3">
            <div class="col-md-6 col-lg-4" *ngFor="let emp of dashboardData.active_employments">
              <div class="card h-100">
                <div class="card-body">
                  <h6 class="card-subtitle mb-2 text-muted">Employment #{{ emp.id }}</h6>
                  <div><strong>Position:</strong> {{ emp.position_id }}</div>
                  <div><strong>Start Date:</strong> {{ emp.start_date | date }}</div>
                  <div><strong>Employment ID:</strong> {{ emp.id }}</div>
                  <div><strong>User ID:</strong> {{ emp.user_id }}</div>
                  <div><strong>Created:</strong> {{ emp.created_at | date:'short' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <h5>Shifts</h5>
          <div class="row g-3">
            <div class="col-md-6 col-lg-4" *ngFor="let shift of dashboardData.shifts">
              <div class="card h-100">
                <div class="card-body">
                  <h6 class="card-subtitle mb-2 text-muted">Shift #{{ shift.id }}</h6>
                  <div><strong>Date:</strong> {{ shift.date | date }}</div>
                  <div><strong>Start:</strong> {{ shift.start_time | date:'shortTime' }}</div>
                  <div><strong>End:</strong> {{ shift.end_time ? (shift.end_time | date:'shortTime') : '—' }}</div>
                  <div><strong>Hours:</strong> <span class="badge bg-primary">{{ shift.hours }}</span></div>
                  <div><strong>Status:</strong> <span [ngClass]="shift.active ? 'badge bg-success' : 'badge bg-secondary'">{{ shift.active ? 'Active' : 'Completed' }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <h5>Current Shifts</h5>
          <div class="row g-3">
            <div class="col-md-6 col-lg-4" *ngFor="let shift of dashboardData.current_shifts">
              <div class="card border-success h-100">
                <div class="card-body">
                  <h6 class="card-subtitle mb-2 text-success">Current Shift #{{ shift.id }}</h6>
                  <div><strong>Date:</strong> {{ shift.date | date }}</div>
                  <div><strong>Start:</strong> {{ shift.start_time | date:'shortTime' }}</div>
                  <div><strong>Hours:</strong> <span class="badge bg-success">{{ shift.hours }}</span></div>
                  <div><strong>Status:</strong> <span class="badge bg-success">Active</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #loading>
        <div>Loading dashboard data...</div>
      </ng-template>
    </div>
  `,
  styles: [``]
})
export class DashboardComponent implements OnInit {
  currentUser: AuthenticatedUser | null = null;
  dashboardData: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.dashboardService.rootGet().subscribe({
      next: (data) => this.dashboardData = data,
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      }
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
