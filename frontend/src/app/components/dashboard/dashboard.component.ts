import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DashboardService, EmploymentsService, ShiftsService, ShiftsIdPatchRequest } from '../../../generated-api';
import { AuthenticatedUser } from '../../../generated-api';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FullCalendarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
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
    allDaySlot: true,
    allDayText: 'Daily Total',
    height: 650,
    scrollTime: '09:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    eventClick: this.handleEventClick.bind(this)
  };

  // Filter state
  employmentFilters: { [employmentId: number]: boolean } = {};
  private employmentColors: { [employmentId: number]: string } = {};

  // Inline editing state for shift descriptions
  editingShiftId: number | null = null;
  editingDescription: string = '';
  savingDescription: boolean = false;
  descriptionError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
    private employmentsService: EmploymentsService,
    private shiftsService: ShiftsService
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

    // Create shift events
    const shiftEvents = filteredShifts.map((shift: any) => {
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

    // Create daily hour summary events
    const dailyEvents = this.createDailyHourEvents();

    // Combine both types of events
    const allEvents = [...shiftEvents, ...dailyEvents];

    this.calendarOptions = {
      ...this.calendarOptions,
      events: allEvents,
      validRange: {
        start: this.getCurrentWeekStart(),
        end: this.getCurrentWeekEnd(),
      }
    };

    console.log('Calendar events updated with', shiftEvents.length, 'shift events and', dailyEvents.length, 'daily summary events');
  }

  // Create daily hour summary events (all-day events)
  createDailyHourEvents(): any[] {
    if (!this.dashboardData?.daily_hours) {
      return [];
    }

    const dailyEvents: any[] = [];

    // Create separate events for each employment on each day
    Object.keys(this.dashboardData.daily_hours).forEach(key => {
      const [date, employmentId] = key.split('_');
      const empId = parseInt(employmentId);
      const hours = this.dashboardData.daily_hours[key];

      // Only include if employment is visible in filter
      if (!this.employmentFilters[empId] || hours === 0) {
        return;
      }

      const employment = this.dashboardData.active_employments.find(
        (emp: any) => emp.id === empId
      );

      if (!employment) return;

      const color = this.getEmploymentColor(empId);

      dailyEvents.push({
        title: `${hours}h - ${employment.position.title}`,
        start: date,
        allDay: true,
        backgroundColor: this.lightenColor(color, 0.7),
        borderColor: color,
        textColor: '#333',
        extendedProps: {
          type: 'daily-summary',
          employmentId: empId,
          hours: hours,
          date: date,
          employment: employment
        }
      });
    });

    return dailyEvents;
  }

  // Helper to lighten a color
  private lightenColor(color: string, factor: number): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Lighten
    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  handleEventClick(info: EventClickArg): void {
    // Handle daily summary events differently
    if (info.event.extendedProps['type'] === 'daily-summary') {
      // For daily summary events, maybe show a tooltip or navigate to day view
      // For now, we'll just prevent the navigation
      console.log('Daily summary clicked:', info.event.extendedProps);
      return;
    }

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

  // Helper to get today's hours for an employment
  getTodayHours(empId: number): number {
    if (!this.dashboardData?.daily_hours) {
      return 0;
    }

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const key = `${today}_${empId}`;
    const hours = this.dashboardData.daily_hours[key];
    return hours || 0;
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

  // Methods for inline description editing
  startEditingDescription(shiftId: number, currentDescription: string = ''): void {
    this.editingShiftId = shiftId;
    this.editingDescription = currentDescription;
    this.descriptionError = null;
  }

  cancelEditingDescription(): void {
    this.editingShiftId = null;
    this.editingDescription = '';
    this.descriptionError = null;
  }

  saveShiftDescription(shiftId: number): void {
    if (this.savingDescription) return;

    this.savingDescription = true;
    this.descriptionError = null;

    // Find the shift data
    const currentShift = this.dashboardData.current_shifts.find((shift: any) => shift.id === shiftId);
    if (!currentShift) {
      this.descriptionError = 'Shift not found';
      this.savingDescription = false;
      return;
    }

    const updateRequest: ShiftsIdPatchRequest = {
      shift: {
        date: currentShift.date,
        start_time: currentShift.start_time,
        end_time: currentShift.end_time,
        employment_id: currentShift.employment_id,
        description: this.editingDescription.trim()
      }
    };

    this.shiftsService.shiftsIdPatch(shiftId, updateRequest).subscribe({
      next: () => {
        this.savingDescription = false;
        this.editingShiftId = null;
        this.editingDescription = '';

        // Update the local shift data immediately for better UX
        const shiftIndex = this.dashboardData.current_shifts.findIndex((shift: any) => shift.id === shiftId);
        if (shiftIndex !== -1) {
          this.dashboardData.current_shifts[shiftIndex].description = updateRequest.shift.description;
        }

        // Optionally refresh dashboard data to ensure consistency
        // this.refreshDashboard();
      },
      error: (err) => {
        this.savingDescription = false;
        this.descriptionError = err?.error?.errors?.[0] || 'Failed to update description.';
      }
    });
  }

  onDescriptionKeydown(event: KeyboardEvent, shiftId: number): void {
    if (event.key === 'Escape') {
      this.cancelEditingDescription();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.saveShiftDescription(shiftId);
    }
  }
}
