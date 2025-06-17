import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardService, EmploymentsService } from '../../generated-api';
import { AuthenticatedUser } from '../../generated-api';

import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <h1 class="mb-3">Dashboard</h1>
      <div *ngIf="dashboardData; else loading">
        <div class="mb-5">
          <h2 class="mb-4">Active Employments</h2>
          <div *ngFor="let emp of dashboardData.active_employments">
            <div class="card h-100 border-primary shadow">
              <div class="card-header d-flex justify-content-between align-items-center user-select-none">
                <div class="d-flex align-items-center gap-2">
                  <!-- Caret icon removed -->
                  <h5 class="card-title mb-0">Employment #{{ emp.id }}</h5>
                </div>
                <div
                  class="badge bg-secondary fs-6 d-flex gap-2"
                  title="Hours for this week"
                >
                  <i class="bi bi-clock"></i>
                  <span>{{ getWeeklyHours(emp.id) }}</span>
                </div>
              </div>
              <div class="card-body" [id]="'employment-body-' + emp.id">
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
                    {{
                      getCurrentShiftHours(currentShift.start_time)
                    }}
                  </div>
                </div>

                <!-- Calendar always visible -->
                <ng-container
                  *ngIf="getWeeklyShiftsForEmployment(emp.id).length > 0; else noShifts"
                >
                  <div #weekCalendarContainer></div>
                </ng-container>
                <ng-template #noShifts>
                  <div class="text-muted">
                    No shifts for this employment this week.
                  </div>
                </ng-template>

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
  clockingInEmploymentId: number | null = null;
  clockInError: string | null = null;
  clockingOutEmploymentId: number | null = null;
  clockOutError: string | null = null;
  @ViewChild('weekCalendarContainer', { static: false, read: ElementRef })
  weekCalendarContainer!: ElementRef;
  public weekCalendars: { [empId: number]: Calendar } = {};

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
      next: (data) => {
        this.dashboardData = data;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      },
    });
  }

  ngAfterViewChecked(): void {
    // Always render week calendar for all employments
    if (this.weekCalendarContainer && this.dashboardData && this.dashboardData.active_employments) {
      this.dashboardData.active_employments.forEach((emp: any) => {
        const empId = emp.id;
        if (!this.weekCalendars[empId]) {
          const events = this.getWeeklyShiftsForEmployment(empId).map((shift: any) => ({
            title: shift.position_title || 'Shift',
            start: shift.start_time || shift.date,
            end: shift.end_time || Date.now(),
            allDay: false,
            extendedProps: shift,
          }));
          const calendarOptions = {
            plugins: [timeGridPlugin],
            initialView: 'timeGridWeek',
            events,
            headerToolbar: false,
            navLinks: false,
            validRange: {
              start: this.getCurrentWeekStart(),
              end: this.getCurrentWeekEnd(),
            },
            allDaySlot: false,
          } as any;
          this.weekCalendars[empId] = new Calendar(this.weekCalendarContainer.nativeElement, calendarOptions);
          this.weekCalendars[empId].render();
        }
      });
    }
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

  // Calculate hours since start_time, rounded to nearest quarter hour
  getCurrentShiftHours(startTime: string | Date): string {
    if (!startTime) return '0.00';
    const start = new Date(startTime);
    const now = new Date();
    let diffMs = now.getTime() - start.getTime();
    if (diffMs < 0) diffMs = 0;
    let hours = diffMs / (1000 * 60 * 60);
    // Round to nearest quarter hour
    hours = Math.round(hours * 4) / 4;
    return hours.toFixed(2);
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

  // Helper to get the start of the current week (Sunday)
  getCurrentWeekStart(): string {
    const now = new Date();
    now.setDate(now.getDate() - now.getDay());
    now.setHours(0, 0, 0, 0);
    return now.toISOString().slice(0, 10);
  }

  // Helper to get the end of the current week (Saturday night)
  getCurrentWeekEnd(): string {
    const now = new Date();
    now.setDate(now.getDate() - now.getDay() + 6);
    now.setHours(23, 59, 59, 999);
    return now.toISOString().slice(0, 10);
  }

  // Helper to get weekly hours for an employment
  getWeeklyHours(empId: number): string {
    if (!this.dashboardData || !this.dashboardData.total_weekly_hours) return '0';
    const hours = this.dashboardData.total_weekly_hours[empId];
    return hours !== undefined ? hours : '0';
  }
}
