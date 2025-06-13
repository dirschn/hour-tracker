import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardService, EmploymentsService } from '../../generated-api';
import { AuthenticatedUser } from '../../generated-api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <h1 class="h3 mb-3">Dashboard</h1>
      <div *ngIf="dashboardData; else loading">
        <div class="mb-5">
          <h2 class="mb-4">Active Employments</h2>
          <div class="row g-4">
            <div
              class="col-md-6 col-lg-4"
              *ngFor="let emp of dashboardData.active_employments"
            >
              <div class="card h-100 border-primary shadow">
                <div class="card-body">
                  <h5 class="card-title">Employment #{{ emp.id }}</h5>
                  <div><strong>Position:</strong> {{ emp.position_id }}</div>
                  <div>
                    <strong>Start Date:</strong> {{ emp.start_date | date }}
                  </div>
                  <div><strong>Employment ID:</strong> {{ emp.id }}</div>
                  <div><strong>User ID:</strong> {{ emp.user_id }}</div>
                  <div>
                    <strong>Created:</strong>
                    {{ emp.created_at | date : 'short' }}
                  </div>
                  <div
                    class="mt-2"
                    *ngIf="
                      dashboardData.total_weekly_hours &&
                      dashboardData.total_weekly_hours[emp.id] !== undefined
                    "
                  >
                    <strong>This Week's Hours:</strong>
                    <span class="badge bg-info fs-5">{{
                      dashboardData.total_weekly_hours[emp.id]
                    }}</span>
                  </div>
                  <div
                    class="mt-2"
                    *ngIf="
                      dashboardData.total_weekly_hours &&
                      dashboardData.total_weekly_hours[emp.id] === undefined
                    "
                  >
                    <strong>This Week's Hours:</strong>
                    <span class="text-muted">0</span>
                  </div>

                  <!-- Current Shift (if any) -->
                  <div
                    *ngIf="getCurrentShiftForEmployment(emp.id) as currentShift"
                    class="alert alert-success py-2 mb-3"
                  >
                    <strong>Current Shift:</strong>
                    <div>Date: {{ currentShift.date | date }}</div>
                    <div>
                      Start: {{ currentShift.start_time | date : 'shortTime' }}
                    </div>
                    <div>
                      Hours so far:
                      <span class="badge bg-success">{{
                        currentShift.hours
                      }}</span>
                    </div>
                    <div>
                      Status: <span class="badge bg-success">Active</span>
                    </div>
                  </div>

                  <button
                    class="btn btn-outline-primary btn-sm mt-3"
                    (click)="
                      expandedEmployment =
                        expandedEmployment === emp.id ? null : emp.id
                    "
                  >
                    {{
                      expandedEmployment === emp.id
                        ? "Hide this week's shifts"
                        : "Show this week's shifts"
                    }}
                  </button>
                  <div *ngIf="expandedEmployment === emp.id" class="mt-3">
                    <ng-container
                      *ngIf="
                        getWeeklyShiftsForEmployment(emp.id).length > 0;
                        else noShifts
                      "
                    >
                      <table class="table table-sm table-bordered align-middle">
                        <thead class="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Hours</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            *ngFor="
                              let shift of getWeeklyShiftsForEmployment(emp.id)
                            "
                          >
                            <td>{{ shift.date | date }}</td>
                            <td>{{ shift.start_time | date : 'shortTime' }}</td>
                            <td>
                              {{
                                shift.end_time
                                  ? (shift.end_time | date : 'shortTime')
                                  : '—'
                              }}
                            </td>
                            <td>
                              <span class="badge bg-primary">{{
                                shift.hours
                              }}</span>
                            </td>
                            <td>
                              <span
                                [ngClass]="
                                  shift.active
                                    ? 'badge bg-success'
                                    : 'badge bg-secondary'
                                "
                                >{{
                                  shift.active ? 'Active' : 'Completed'
                                }}</span
                              >
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </ng-container>
                    <ng-template #noShifts>
                      <div class="text-muted">
                        No shifts for this employment this week.
                      </div>
                    </ng-template>
                  </div>

                  <!-- Clock In button (if no current shift) -->
                  <div
                    *ngIf="!getCurrentShiftForEmployment(emp.id)"
                    class="mt-3"
                  >
                    <button
                      class="btn btn-success"
                      (click)="clockIn(emp.id)"
                      [disabled]="clockingInEmploymentId === emp.id"
                    >
                      <span *ngIf="clockingInEmploymentId === emp.id"
                        >Clocking in...</span
                      >
                      <span *ngIf="clockingInEmploymentId !== emp.id"
                        >Clock In</span
                      >
                    </button>
                    <div
                      *ngIf="clockInError && clockingInEmploymentId === emp.id"
                      class="text-danger mt-2"
                    >
                      {{ clockInError }}
                    </div>
                  </div>

                  <!-- Clock Out button (if current shift is active) -->
                  <div
                    *ngIf="getCurrentShiftForEmployment(emp.id)"
                    class="mt-3"
                  >
                    <button
                      class="btn btn-danger"
                      (click)="clockOut(emp.id)"
                      [disabled]="clockingOutEmploymentId === emp.id"
                    >
                      <span *ngIf="clockingOutEmploymentId === emp.id"
                        >Clocking out...</span
                      >
                      <span *ngIf="clockingOutEmploymentId !== emp.id"
                        >Clock Out</span
                      >
                    </button>
                    <div
                      *ngIf="clockOutError && clockingOutEmploymentId === emp.id"
                      class="text-danger mt-2"
                    >
                      {{ clockOutError }}
                    </div>
                  </div>
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
  styles: [``],
})
export class DashboardComponent implements OnInit {
  currentUser: AuthenticatedUser | null = null;
  dashboardData: any = null;
  expandedEmployment: number | null = null;
  clockingInEmploymentId: number | null = null;
  clockInError: string | null = null;
  clockingOutEmploymentId: number | null = null;
  clockOutError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
    private employmentsService: EmploymentsService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.dashboardService.rootGet().subscribe({
      next: (data) => (this.dashboardData = data),
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      },
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
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getCurrentDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date());
  }

  // Helper to get this week's shifts for an employment
  getWeeklyShiftsForEmployment(empId: number): any[] {
    if (!this.dashboardData || !this.dashboardData.shifts) return [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return this.dashboardData.shifts.filter(
      (shift: any) =>
        shift.employment_id === empId &&
        new Date(shift.date) >= weekStart &&
        new Date(shift.date) <= weekEnd
    );
  }

  // Helper to get the current shift for an employment
  getCurrentShiftForEmployment(empId: number): any | null {
    if (!this.dashboardData || !this.dashboardData.current_shifts) return null;
    return (
      this.dashboardData.current_shifts.find(
        (shift: any) => shift.employment_id === empId
      ) || null
    );
  }

  // Call the API to clock in for an employment
  clockIn(empId: number): void {
    this.clockingInEmploymentId = empId;
    this.clockInError = null;
    this.employmentsService
      .employmentsIdClockInPost(empId.toString())
      .subscribe({
        next: () => {
          this.clockingInEmploymentId = null;
          this.refreshDashboard();
        },
        error: (err) => {
          this.clockingInEmploymentId = null;
          this.clockInError = err?.error?.errors?.[0] || 'Failed to clock in.';
        },
      });
  }

  // Call the API to clock out for an employment
  clockOut(empId: number): void {
    this.clockingOutEmploymentId = empId;
    this.clockOutError = null;
    this.employmentsService
      .employmentsIdClockOutPost(empId.toString())
      .subscribe({
        next: () => {
          this.clockingOutEmploymentId = null;
          this.refreshDashboard();
        },
        error: (err) => {
          this.clockingOutEmploymentId = null;
          this.clockOutError = err?.error?.errors?.[0] || 'Failed to clock out.';
        },
      });
  }

  // Refresh dashboard data
  refreshDashboard(): void {
    // You may need to update this to use the correct service if dashboardService is not correct
    // For now, leaving as is
    this.dashboardService.rootGet().subscribe({
      next: (data) => (this.dashboardData = data),
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      },
    });
  }
}
