import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DashboardService, EmploymentsService } from '../../generated-api';
import { AuthenticatedUser } from '../../generated-api';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FullCalendarModule],
  template: `
    <div class="container-fluid py-4">
      <div *ngIf="dashboardData; else loading">
        <!-- Single Calendar Section -->
        <div *ngIf="getFilteredShifts().length > 0" class="mb-4">
          <div class="card shadow">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-calendar-week me-2"></i>
                This Week's Schedule
                <span *ngIf="getVisibleEmploymentCount() < dashboardData.active_employments.length" class="badge bg-info ms-2">
                  {{ getVisibleEmploymentCount() }} of {{ dashboardData.active_employments.length }} shown
                </span>
              </h5>
            </div>
            <div class="card-body">
              <full-calendar [options]="calendarOptions"></full-calendar>
            </div>
          </div>
        </div>

        <!-- No calendar shifts message when filtered -->
        <div *ngIf="this.dashboardData?.shifts.length > 0 && getFilteredShifts().length === 0" class="mb-4">
          <div class="card shadow">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-calendar-week me-2"></i>
                This Week's Schedule
                <span class="badge bg-warning ms-2">All filtered out</span>
              </h5>
            </div>
            <div class="card-body text-center py-4">
              <div class="text-muted">
                <i class="bi bi-funnel display-1 mb-3"></i>
                <h4>No Shifts Visible</h4>
                <p>All shifts are hidden. Toggle the calendar visibility on employment cards to show shifts.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
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
          <div class="row row-cols-1 row-cols-xl-2 row-cols-xxl-3 g-4">
            <div *ngFor="let emp of dashboardData.active_employments; trackBy: trackByEmploymentId">
              <div class="card col border-primary shadow">
                <div class="card-header" [style.border-left]="'4px solid ' + getEmploymentColor(emp.id)">
                  <!-- Main header row -->
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2 flex-grow-1 text-truncate">
                      <div class="flex-fill text-truncate">
                        <h5 class="card-title mb-0 fs-6 lh-sm">{{ emp.position.title }}</h5>
                        <small class="text-muted">{{ emp.company.name }}</small>
                      </div>
                    </div>

                    <!-- Calendar filter toggle -->
                    <div class="flex-shrink-0 me-2">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          [id]="'calendar-toggle-' + emp.id"
                          [(ngModel)]="employmentFilters[emp.id]"
                          (change)="onFilterChange()"
                          title="Show/hide shifts in calendar"
                        >
                        <label class="form-check-label" [for]="'calendar-toggle-' + emp.id">
                          <i class="bi bi-calendar-week text-muted"></i>
                        </label>
                      </div>
                    </div>

                    <!-- Clock button -->
                    <div class="flex-shrink-0">
                      <!-- Clock In button (if no current shift) -->
                      <button
                        *ngIf="!getCurrentShiftForEmployment(emp.id)"
                        class="btn btn-success btn-sm d-flex align-items-center gap-1"
                        (click)="clockIn(emp.id)"
                        [disabled]="clockingInEmploymentId === emp.id"
                        title="Clock In"
                      >
                        <span *ngIf="clockingInEmploymentId === emp.id">
                          <span class="spinner-border spinner-border-sm"></span>
                        </span>
                        <i *ngIf="clockingInEmploymentId !== emp.id" class="bi bi-play-fill"></i>
                        <span class="d-none d-sm-inline">Clock In</span>
                      </button>

                      <!-- Clock Out button (if current shift is active) -->
                      <button
                        *ngIf="getCurrentShiftForEmployment(emp.id)"
                        class="btn btn-danger btn-sm d-flex align-items-center gap-1"
                        (click)="clockOut(emp.id)"
                        [disabled]="clockingOutEmploymentId === emp.id"
                        title="Clock Out"
                      >
                        <span *ngIf="clockingOutEmploymentId === emp.id">
                          <span class="spinner-border spinner-border-sm"></span>
                        </span>
                        <i *ngIf="clockingOutEmploymentId !== emp.id" class="bi bi-stop-fill"></i>
                        <span class="d-none d-sm-inline">Clock Out</span>
                      </button>
                    </div>
                  </div>

                  <!-- Secondary info row -->
                  <div class="border-top border-opacity-25 pt-2">
                    <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                      <div class="d-flex flex-wrap gap-2 align-items-center">
                        <!-- Current shift status -->
                        <div *ngIf="getCurrentShiftForEmployment(emp.id) as currentShift"
                            class="badge bg-success d-flex align-items-center gap-1 fs-6 py-2 px-2"
                            title="Hours for current shift">
                          <i class="bi bi-clock-fill"></i>
                          <span class="d-none d-sm-inline">{{ getCurrentShiftHours(currentShift.start_time) }}h active</span>
                          <span class="d-sm-none">{{ getCurrentShiftHours(currentShift.start_time) }}h</span>
                        </div>

                        <!-- Weekly hours badge -->
                        <div class="badge bg-secondary d-flex align-items-center gap-1 fs-6 py-2 px-2" title="Hours for this week">
                          <i class="bi bi-calendar-week"></i>
                          <span class="d-none d-sm-inline">{{ getWeeklyHours(emp.id) }}h this week</span>
                          <span class="d-sm-none">{{ getWeeklyHours(emp.id) }}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card body with current shift details and link -->
                <div class="card-body">
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

                  <!-- Employment details and link -->
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="text-muted small">
                      {{ getWeeklyShiftsForEmployment(emp.id).length }} shift(s) this week
                      <span *ngIf="!employmentFilters[emp.id]" class="text-warning">
                        (hidden from calendar)
                      </span>
                    </div>
                    <a
                      [routerLink]="['/employments', emp.id]"
                      class="btn btn-outline-primary btn-sm"
                    >
                      <i class="bi bi-eye me-1"></i>
                      View Details
                    </a>
                  </div>

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
        min-height: 400px;
      }
      .employment-filter-label {
        padding-left: 8px;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: AuthenticatedUser | null = null;
  dashboardData: any = null;
  clockingInEmploymentId: number | null = null;
  clockInError: string | null = null;
  clockingOutEmploymentId: number | null = null;
  clockOutError: string | null = null;
  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin],
    initialView: 'timeGridWeek',
    events: [],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    allDaySlot: false,
    height: 600,
    scrollTime: '09:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    eventClick: this.handleEventClick.bind(this)
  };

  // Filter state
  employmentFilters: { [employmentId: number]: boolean } = {};
  private employmentColors: { [employmentId: number]: string } = {};

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
        this.initializeFilters();
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      },
    });
  }

  // Refresh dashboard data
  refreshDashboard(): void {
    // Store current filter state
    const currentFilters = { ...this.employmentFilters };

    this.dashboardService.rootGet().subscribe({
      next: (data) => {
        this.dashboardData = data;

        // Restore filter state for existing employments
        this.initializeFilters();
        Object.keys(currentFilters).forEach(empId => {
          const empIdNum = parseInt(empId);
          if (this.employmentFilters.hasOwnProperty(empIdNum)) {
            this.employmentFilters[empIdNum] = currentFilters[empIdNum];
          }
        });

        // Update calendar events after data refresh
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.dashboardData = null;
      },
    });
  }

  // Initialize employment filters - all visible by default
  private initializeFilters(): void {
    if (!this.dashboardData?.active_employments) return;

    // Initialize all filters to true (visible)
    this.employmentFilters = {};
    this.dashboardData.active_employments.forEach((emp: any) => {
      this.employmentFilters[emp.id] = true;
    });

    // Initialize colors
    this.initializeEmploymentColors();
  }

  // Initialize consistent colors for employments
  private initializeEmploymentColors(): void {
    if (!this.dashboardData?.active_employments) return;

    const colors = [
      '#3788d8', '#28a745', '#dc3545', '#ffc107', '#6f42c1',
      '#fd7e14', '#20c997', '#e83e8c', '#6c757d', '#17a2b8'
    ];

    this.employmentColors = {};
    this.dashboardData.active_employments.forEach((emp: any, index: number) => {
      this.employmentColors[emp.id] = colors[index % colors.length];
    });
  }

  // Get color for an employment
  getEmploymentColor(employmentId: number): string {
    return this.employmentColors[employmentId] || '#3788d8';
  }

  // Get filtered employments based on filter state
  getFilteredEmployments(): any[] {
    if (!this.dashboardData?.active_employments) return [];

    return this.dashboardData.active_employments.filter((emp: any) =>
      this.employmentFilters[emp.id] === true
    );
  }

  // Get filtered shifts based on employment filters
  getFilteredShifts(): any[] {
    if (!this.dashboardData?.shifts) return [];

    return this.dashboardData.shifts.filter((shift: any) => {
      const isEmploymentVisible = this.employmentFilters[shift.employment_id] === true;
      return isEmploymentVisible;
    });
  }

  // Get count of visible employments
  getVisibleEmploymentCount(): number {
    return Object.values(this.employmentFilters).filter(visible => visible).length;
  }

  // Toggle all filters on/off
  toggleAllFilters(visible: boolean): void {
    Object.keys(this.employmentFilters).forEach(empId => {
      this.employmentFilters[parseInt(empId)] = visible;
    });
    this.onFilterChange();
  }

  // Handle filter change
  onFilterChange(): void {
    this.updateCalendarEvents();
  }

  // Update calendar events based on filtered data
  updateCalendarEvents(): void {
    if (!this.dashboardData) {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: []
      };
      return;
    }

    const filteredShifts = this.getFilteredShifts();
    if (filteredShifts.length === 0) {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: []
      };
      return;
    }

    // Create events with different colors for different employments
    const events = filteredShifts.map((shift: any) => {
      const employment = this.dashboardData.active_employments.find(
        (emp: any) => emp.id === shift.employment_id
      );

      const color = this.getEmploymentColor(shift.employment_id);

      return {
        title: `${employment?.position?.title || 'Shift'} - ${employment?.company?.name || ''}`,
        start: shift.start_time || shift.date,
        end: shift.end_time || Date.now(),
        allDay: false,
        backgroundColor: color,
        borderColor: color,
        extendedProps: shift,
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events,
      validRange: {
        start: this.getCurrentWeekStart(),
        end: this.getCurrentWeekEnd(),
      }
    };

    console.log('Main calendar events updated with', events.length, 'filtered events');
  }

  handleEventClick(info: EventClickArg): void {
    // Navigate directly to shift edit when clicking on a shift
    this.router.navigate([`/shifts/${info.event.extendedProps['id']}/edit`], {
      queryParams: { returnUrl: '/' }
    });
  }


  // Helper to track by employment ID
  trackByEmploymentId(index: number, emp: any): number {
    return emp.id;
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
