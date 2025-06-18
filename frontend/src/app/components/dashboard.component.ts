import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="mb-0">Dashboard</h1>
      </div>

      <div *ngIf="dashboardData; else loading">
        <div class="mb-5">
          <h2 class="mb-4">Active Employments</h2>

          <div
            *ngIf="dashboardData.active_employments.length === 0"
            class="text-center py-5"
          >
            <div class="text-muted">
              <i class="bi bi-briefcase display-1 mb-3"></i>
              <h4>No Active Employments</h4>
              <p>Get started by adding your first employment!</p>
              <button
                class="btn btn-primary btn-lg"
                (click)="navigateTo('/employments/new')"
              >
                <i class="bi bi-plus-lg me-2"></i>
                Add Your First Employment
              </button>
            </div>
          </div>

          <div *ngFor="let emp of dashboardData.active_employments; trackBy: trackByEmploymentId">
            <div class="card h-100 border-primary shadow mb-4">
              <div
                class="card-header d-flex justify-content-between align-items-center user-select-none"
                (click)="toggleEmploymentCollapse(emp.id)"
                style="cursor: pointer;"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-chevron-right chevron-icon"
                     [class.expanded]="isEmploymentExpanded(emp.id)"></i>
                  <h5 class="card-title mb-0">
                    {{ emp.position.title }} &#64; {{ emp.company.name }}
                  </h5>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <!-- Current shift status -->
                  <div *ngIf="getCurrentShiftForEmployment(emp.id) as currentShift"
                       class="badge bg-success d-flex align-items-center gap-1"
                       title="Hours for current shift">
                    <i class="bi bi-clock-fill"></i>
                    <span>{{ getCurrentShiftHours(currentShift.start_time) }}h</span>
                  </div>

                  <!-- Clock In/Out Buttons -->
                  <div class="d-flex gap-2" (click)="$event.stopPropagation()">
                    <!-- Clock In button (if no current shift) -->
                    <button
                      *ngIf="!getCurrentShiftForEmployment(emp.id)"
                      class="btn btn-success btn-sm"
                      (click)="clockIn(emp.id)"
                      [disabled]="clockingInEmploymentId === emp.id"
                      title="Clock In"
                    >
                      <span *ngIf="clockingInEmploymentId === emp.id">
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      </span>
                      <i *ngIf="clockingInEmploymentId !== emp.id" class="bi bi-play-fill"></i>
                      Clock In
                    </button>

                    <!-- Clock Out button (if current shift is active) -->
                    <button
                      *ngIf="getCurrentShiftForEmployment(emp.id)"
                      class="btn btn-danger btn-sm"
                      (click)="clockOut(emp.id)"
                      [disabled]="clockingOutEmploymentId === emp.id"
                      title="Clock Out"
                    >
                      <span *ngIf="clockingOutEmploymentId === emp.id">
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      </span>
                      <i *ngIf="clockingOutEmploymentId !== emp.id" class="bi bi-stop-fill"></i>
                      Clock Out
                    </button>
                  </div>

                  <!-- Weekly hours badge -->
                  <div
                    class="badge bg-secondary fs-6 d-flex gap-2"
                    title="Hours for this week"
                  >
                    <i class="bi bi-clock"></i>
                    <span>{{ getWeeklyHours(emp.id) }}</span>
                  </div>
                </div>
              </div>

              <!-- Collapsible content -->
              <div *ngIf="isEmploymentExpanded(emp.id)" class="card-body" [id]="'employment-body-' + emp.id">
                <div
                  *ngIf="getCurrentShiftForEmployment(emp.id) as currentShift"
                  class="alert alert-success py-2 mb-3"
                >
                  <strong>Current Shift Details:</strong>
                  <div>Date: {{ currentShift.date | date }}</div>
                  <div>
                    Start: {{ currentShift.start_time | date : 'shortTime' }}
                  </div>
                  <div>
                    Hours so far:
                    {{ getCurrentShiftHours(currentShift.start_time) }}
                  </div>
                </div>

                <!-- Calendar always visible when expanded -->
                <ng-container
                  *ngIf="
                    getWeeklyShiftsForEmployment(emp.id).length > 0;
                    else noShifts
                  "
                >
                  <h6 class="mb-3">This Week's Schedule:</h6>
                  <div
                    [id]="'calendar-container-' + emp.id"
                    class="calendar-container"
                  ></div>
                </ng-container>
                <ng-template #noShifts>
                  <div class="text-muted">
                    No shifts for this employment this week.
                  </div>
                </ng-template>

                <!-- Error messages -->
                <div
                  *ngIf="clockInError && clockingInEmploymentId === emp.id"
                  class="alert alert-danger mt-3"
                >
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ clockInError }}
                </div>
                <div
                  *ngIf="clockOutError && clockingOutEmploymentId === emp.id"
                  class="alert alert-danger mt-3"
                >
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ clockOutError }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #loading>
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading dashboard data...</span>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .calendar-container {
        min-height: 200px;
      }
      .chevron-icon {
        transition: transform 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        transform-origin: center;
        will-change: transform;
      }
      .chevron-icon.expanded {
        transform: rotate(90deg) scale(1.2);
        animation: chevron-bounce 0.4s ease-out;
      }
      .chevron-icon:not(.expanded) {
        transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      @keyframes chevron-bounce {
        0% { transform: rotate(0deg) scale(1); }
        40% { transform: rotate(45deg) scale(1.4); }
        70% { transform: rotate(110deg) scale(0.9); }
        100% { transform: rotate(90deg) scale(1.2); }
      }
      .card-header:hover {
        background-color: rgba(var(--bs-primary-rgb), 0.1);
      }
      .card-header:hover .chevron-icon {
        transform: scale(1.2);
        transition: transform 0.15s ease-out;
      }
      .card-header:hover .chevron-icon.expanded {
        transform: rotate(90deg) scale(1.35);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  currentUser: AuthenticatedUser | null = null;
  dashboardData: any = null;
  clockingInEmploymentId: number | null = null;
  clockInError: string | null = null;
  clockingOutEmploymentId: number | null = null;
  clockOutError: string | null = null;
  public weekCalendars: { [empId: number]: Calendar } = {};
  private calendarsInitialized = false;
  private expandedEmployments: Set<number> = new Set();

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
        // Initialize calendars after data is loaded if view is ready
        if (!this.calendarsInitialized) {
          setTimeout(() => this.initializeCalendars(), 0);
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      },
    });
  }

  ngAfterViewInit(): void {
    // Initialize calendars if data is already loaded
    if (this.dashboardData && !this.calendarsInitialized) {
      setTimeout(() => this.initializeCalendars(), 0);
    }
  }

  ngOnDestroy(): void {
    // Clean up calendars when component is destroyed
    Object.values(this.weekCalendars).forEach((calendar) => {
      if (calendar) {
        calendar.destroy();
      }
    });
    this.weekCalendars = {};
    this.calendarsInitialized = false;
  }

  // Refresh dashboard data
  refreshDashboard(): void {
    // Destroy existing calendars before refreshing data
    Object.values(this.weekCalendars).forEach((calendar) => {
      if (calendar) {
        calendar.destroy();
      }
    });
    this.weekCalendars = {};
    this.calendarsInitialized = false;

    this.dashboardService.rootGet().subscribe({
      next: (data) => {
        this.dashboardData = data;
        // Recreate calendars after data refresh
        setTimeout(() => this.initializeCalendars(), 100);
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      },
    });
  }

  // Initialize all calendars
  private initializeCalendars(): void {
    if (!this.dashboardData?.active_employments || this.calendarsInitialized) {
      return;
    }

    console.log(
      'Initializing calendars for',
      this.dashboardData.active_employments.length,
      'employments'
    );

    // Don't render calendars immediately since sections start collapsed
    // They will be rendered when sections are expanded via setupCollapseListeners
    this.calendarsInitialized = true;
  }

  // Add a new method to handle calendar rendering
  private renderCalendars(): void {
    this.initializeCalendars();
  }

  // Extract calendar creation logic into a separate method
  private renderCalendarForEmployment(empId: number): void {
    // Don't create calendar if it already exists
    if (this.weekCalendars[empId]) {
      return;
    }

    const shifts = this.getWeeklyShiftsForEmployment(empId);
    if (shifts.length === 0) {
      console.log(
        'No shifts found for employment',
        empId,
        '- skipping calendar'
      );
      return; // Don't render calendar if no shifts
    }

    // Wait for DOM to be ready and retry if container not found
    const attemptRender = (attempt: number = 1) => {
      const calendarContainer = document.getElementById(
        'calendar-container-' + empId
      );

      if (!calendarContainer) {
        if (attempt <= 5) {
          console.log(
            `Calendar container not found for employment ${empId}, attempt ${attempt}/5, retrying...`
          );
          setTimeout(() => attemptRender(attempt + 1), 100);
          return;
        } else {
          console.error(
            'Calendar container not found for employment',
            empId,
            'after 5 attempts'
          );
          return;
        }
      }

      // Check if the container is visible (not in a collapsed section)
      const collapseParent = document.getElementById(`collapse-${empId}`);
      if (collapseParent && !collapseParent.classList.contains('show')) {
        console.log(`Calendar container for employment ${empId} is not visible, skipping render`);
        return;
      }

      // Clear any existing content in the container
      calendarContainer.innerHTML = '';

      const events = shifts.map((shift: any) => ({
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
        height: 'auto',
      } as any;

      try {
        this.weekCalendars[empId] = new Calendar(
          calendarContainer,
          calendarOptions
        );
        this.weekCalendars[empId].render();
        console.log('Calendar successfully rendered for employment', empId);
      } catch (error) {
        console.error('Error rendering calendar for employment', empId, error);
      }
    };

    attemptRender();
  }

  // Helper to track by employment ID
  trackByEmploymentId(index: number, emp: any): number {
    return emp.id;
  }

  // Toggle employment collapse state
  toggleEmploymentCollapse(empId: number): void {
    if (this.expandedEmployments.has(empId)) {
      this.expandedEmployments.delete(empId);
      // Clean up calendar when collapsing
      if (this.weekCalendars[empId]) {
        this.weekCalendars[empId].destroy();
        delete this.weekCalendars[empId];
        console.log(`Calendar destroyed for employment ${empId}`);
      }
    } else {
      this.expandedEmployments.add(empId);
      // Render calendar when expanding
      setTimeout(() => {
        this.renderCalendarForEmployment(empId);
      }, 100);
    }
  }

  // Check if employment is expanded
  isEmploymentExpanded(empId: number): boolean {
    return this.expandedEmployments.has(empId);
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
    if (!this.dashboardData || !this.dashboardData.total_weekly_hours)
      return '0';
    const hours = this.dashboardData.total_weekly_hours[empId];
    return hours !== undefined ? hours : '0';
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
          this.clockOutError =
            err?.error?.errors?.[0] || 'Failed to clock out.';
        },
      });
  }

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/sign_in']);
      },
      error: (error) => {
        console.error('Sign out error:', error);
        // Still navigate to sign-in even if API call fails
        this.router.navigate(['/sign_in']);
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
