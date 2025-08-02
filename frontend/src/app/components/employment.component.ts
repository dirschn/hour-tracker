import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmploymentsService, EmploymentResponse, ShiftsService } from '../../generated-api';

import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-employment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <div *ngIf="employmentData; else loading">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3">{{ employmentData.employment.position.title }} &#64; {{ employmentData.employment.company.name }}</h1>
        </div>

        <!-- Employment Information Card -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-briefcase me-2"></i>
              Employment Information
            </h5>
          </div>
          <div class="card-body">
            <p><strong>Start Date:</strong> {{ employmentData.employment.start_date | date:'longDate' }}</p>
            <p *ngIf="employmentData.employment.end_date"><strong>End Date:</strong> {{ employmentData.employment.end_date | date:'longDate' }}</p>
            <p><strong>Status:</strong> {{ employmentData.employment.active ? 'Active' : 'Inactive' }}</p>
          </div>
        </div>

        <!-- Calendar Section -->
        <div *ngIf="employmentData.employment.shifts && employmentData.employment.shifts.length > 0" class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-calendar-week me-2"></i>
              Shifts Calendar
            </h5>
          </div>
          <div class="card-body">
            <div id="employment-calendar" class="calendar-container"></div>
          </div>
        </div>

        <!-- Weekly Table Section -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-table me-2"></i>
              Weekly Summary
            </h5>
            <button class="btn btn-sm btn-outline-secondary" (click)="copyTableToClipboard()" title="Copy table to clipboard">
              <i class="bi bi-clipboard me-1"></i>
              Copy
            </button>
          </div>
          <div class="card-body">
            <!-- Date Range Selection -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="startDate" class="form-label">Start Date</label>
                <input type="date" id="startDate" class="form-control" [(ngModel)]="startDate" (change)="updateWeeklyTable()">
              </div>
              <div class="col-md-6">
                <label for="endDate" class="form-label">End Date</label>
                <input type="date" id="endDate" class="form-control" [(ngModel)]="endDate" (change)="updateWeeklyTable()">
              </div>
            </div>

            <!-- Weekly Table -->
            <div class="table-responsive">
              <table class="table table-striped table-hover" #weeklyTable>
                <thead>
                  <tr>
                    <th class="align-middle">Date</th>
                    <th class="align-middle">Hours</th>
                    <th class="align-middle">Times</th>
                    <th class="align-middle">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let day of weeklyTableData; index as i">
                    <td class="align-middle">{{ day.date | date:'MMM d' }}</td>
                    <td class="align-middle">{{ day.hours }}</td>
                    <td class="align-middle">{{ day.times }}</td>
                    <td class="align-middle position-relative" style="min-width: 200px; cursor: pointer;"
                        (click)="startEditingNotes(day)"
                        [class.table-warning]="day.isEditing">
                      <div *ngIf="!day.isEditing" class="p-1 rounded" [title]="day.notes"
                           [class.text-muted]="!day.notes" [class.fst-italic]="!day.notes">
                        {{ day.notes || 'Click to add notes...' }}
                      </div>
                      <div *ngIf="day.isEditing" class="p-2">
                        <textarea
                          #notesTextarea
                          [(ngModel)]="day.editingNotes"
                          class="form-control form-control-sm"
                          style="resize: vertical; min-height: 60px;"
                          (blur)="saveNotes(day)"
                          (keydown)="onNotesKeydown($event, day)"
                          placeholder="Add notes for this day..."
                          rows="2">
                        </textarea>
                        <div class="d-flex align-items-center flex-wrap mt-1">
                          <button type="button" class="btn btn-sm btn-success me-1" (click)="saveNotes(day)">
                            <i class="bi bi-check"></i>
                          </button>
                          <button type="button" class="btn btn-sm btn-secondary" (click)="cancelEditingNotes(day)">
                            <i class="bi bi-x"></i>
                          </button>
                          <small class="text-muted ms-2">Ctrl+Enter to save, Esc to cancel</small>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr class="table-primary fw-bold">
                    <td class="align-middle">Total</td>
                    <td class="align-middle">{{ getTotalHours() }}</td>
                    <td class="align-middle">-</td>
                    <td class="align-middle">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-end mb-3">
          <button type="button" class="btn btn-primary me-2" (click)="editEmployment()">
            <i class="bi bi-pencil me-2"></i>Edit
          </button>
          <button type="button" class="btn btn-danger" (click)="deleteEmployment()">
            <i class="bi bi-trash me-2"></i>Delete
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <ng-template #loading>
        <p>Loading employment details...</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .calendar-container {
        min-height: 400px;
      }

      .weekly-table-container {
        max-height: 500px;
        overflow-y: auto;
      }
    `
  ]
})
export class EmploymentComponent implements OnInit, AfterViewInit, OnDestroy {
  employmentData: EmploymentResponse | null = null;
  calendar: Calendar | null = null;
  startDate: string = '';
  endDate: string = '';
  weeklyTableData: any[] = [];
  employmentId: string | null = null;

  constructor(
    private employmentsService: EmploymentsService,
    private shiftsService: ShiftsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.route.paramMap.subscribe(params => {
      this.employmentId = params.get('id');
      if (this.employmentId) {
        this.loadEmploymentDetails();
      }
    });
  }

  ngAfterViewInit(): void {
    // Calendar will be initialized after data is loaded
  }

  ngOnDestroy(): void {
    if (this.calendar) {
      this.calendar.destroy();
    }
  }

  setDefaultDateRange(): void {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    this.startDate = startOfWeek.toISOString().slice(0, 10);
    this.endDate = endOfWeek.toISOString().slice(0, 10);
  }

  loadEmploymentDetails(): void {
    if (this.employmentId) {
      this.employmentsService.employmentsIdGet(this.employmentId).subscribe({
        next: (response) => {
          this.employmentData = response;
          this.updateWeeklyTable();
          setTimeout(() => this.initializeCalendar(), 100);
        },
        error: (error) => {
          console.error('Error loading employment details:', error);
        }
      });
    }
  }

  initializeCalendar(): void {
    if (!this.employmentData?.employment.shifts || this.employmentData.employment.shifts.length === 0) {
      return;
    }

    const calendarContainer = document.getElementById('employment-calendar');
    if (!calendarContainer) {
      setTimeout(() => this.initializeCalendar(), 100);
      return;
    }

    // Clear any existing content
    calendarContainer.innerHTML = '';

    // Convert shifts to calendar events
    const events = this.employmentData.employment.shifts.map((shift: any) => ({
      title: `${this.employmentData?.employment.position.title || 'Shift'}`,
      start: shift.start_time || shift.date,
      end: shift.end_time || new Date(shift.date + 'T23:59:59'),
      allDay: !shift.start_time || !shift.end_time,
      backgroundColor: '#3788d8',
      borderColor: '#3788d8',
      extendedProps: shift,
    }));

    const calendarOptions = {
      plugins: [timeGridPlugin],
      initialView: 'timeGridWeek',
      events,
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
      eventClick: (info: any) => {
        // Navigate directly to shift edit when clicking on a shift
        const currentPath = this.router.url.split('?')[0]; // Remove any existing query params
        this.router.navigate([`/shifts/${info.event.extendedProps.id}/edit`], {
          queryParams: { returnUrl: currentPath }
        });
      }
    } as any;

    try {
      this.calendar = new Calendar(calendarContainer, calendarOptions);
      this.calendar.render();
      console.log('Calendar successfully rendered with', events.length, 'events');
    } catch (error) {
      console.error('Error rendering calendar', error);
    }
  }

  updateWeeklyTable(): void {
    if (!this.employmentData?.employment.shifts) {
      this.weeklyTableData = [];
      return;
    }

    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Filter shifts within date range
    const shiftsInRange = this.employmentData.employment.shifts.filter((shift: any) => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    });

    // Group shifts by date
    const shiftsByDate: { [key: string]: any[] } = {};
    shiftsInRange.forEach((shift: any) => {
      const dateKey = shift.date;
      if (!shiftsByDate[dateKey]) {
        shiftsByDate[dateKey] = [];
      }
      shiftsByDate[dateKey].push(shift);
    });

    // Create table data
    this.weeklyTableData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().slice(0, 10);
      const dayShifts = shiftsByDate[dateKey] || [];

      if (dayShifts.length > 0) {
        const totalHours = this.calculateDayHours(dayShifts);
        const times = this.formatDayTimes(dayShifts);
        const notes = this.formatDayNotes(dayShifts);

        this.weeklyTableData.push({
          date: new Date(currentDate),
          hours: totalHours,
          times: times,
          notes: notes,
          isEditing: false,
          editingNotes: ''
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  calculateDayHours(shifts: any[]): string {
    let totalMinutes = 0;

    shifts.forEach((shift: any) => {
      if (shift.start_time && shift.end_time) {
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        const diffMs = end.getTime() - start.getTime();
        totalMinutes += diffMs / (1000 * 60);
      }
    });

    let hours = totalMinutes / 60;
    if (hours < 0) hours = 0;
    // Round to nearest quarter hour (same as dashboard)
    hours = Math.round(hours * 4) / 4;
    return hours.toFixed(2);
  }

  formatDayTimes(shifts: any[]): string {
    return shifts
      .filter((shift: any) => shift.start_time && shift.end_time)
      .map((shift: any) => {
        const start = new Date(shift.start_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const end = new Date(shift.end_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return `${start}-${end}`;
      })
      .join(', ');
  }

  formatDayNotes(shifts: any[]): string {
    return shifts
      .filter((shift: any) => shift.description && shift.description.trim())
      .map((shift: any) => shift.description.trim())
      .join('; ');
  }

  getTotalHours(): string {
    const total = this.weeklyTableData.reduce((sum, day) => {
      return sum + parseFloat(day.hours || '0');
    }, 0);
    return total.toFixed(2);
  }

  copyTableToClipboard(): void {
    // Create markdown table without notes column
    let markdownTable = '| Date | Hours | Times |\n';
    markdownTable += '|------|-------|-------|\n';

    // Collect notes for separate list
    let notesList: string[] = [];

    this.weeklyTableData.forEach((day) => {
      const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const times = day.times || '-';
      markdownTable += `| ${date} | ${day.hours} | ${times} |\n`;

      // Collect notes if they exist
      if (day.notes && day.notes.trim() && day.notes !== '-') {
        notesList.push(day.notes.trim());
      }
    });

    markdownTable += `| **Total** | **${this.getTotalHours()}** | **-** |\n`;

    // Add notes as unordered list if any exist
    if (notesList.length > 0) {
      markdownTable += '\n';
      notesList.forEach(note => {
        markdownTable += `${note}\n`;
      });
    }

    // Copy markdown to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(markdownTable).then(() => {
        console.log('Table copied to clipboard as markdown');
      }).catch(err => {
        console.error('Failed to copy table to clipboard', err);
        this.fallbackCopyToClipboard(markdownTable);
      });
    } else {
      this.fallbackCopyToClipboard(markdownTable);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      console.log('Table copied to clipboard (fallback)');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
  }

  editEmployment(): void {
    if (this.employmentId) {
      this.router.navigate(['/employments', this.employmentId, 'edit']);
    }
  }

  deleteEmployment(): void {
    if (this.employmentId) {
      this.employmentsService.employmentsIdDelete(this.employmentId).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting employment:', error);
        }
      });
    }
  }

  startEditingNotes(day: any): void {
    // Don't start editing if already editing
    if (day.isEditing) {
      return;
    }

    day.isEditing = true;
    day.editingNotes = day.notes || '';

    // Focus the textarea after a short delay to ensure it's rendered
    setTimeout(() => {
      const textarea = document.querySelector('.notes-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    }, 50);
  }

  cancelEditingNotes(day: any): void {
    day.isEditing = false;
    day.editingNotes = '';
  }

  onNotesKeydown(event: KeyboardEvent, day: any): void {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.saveNotes(day);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditingNotes(day);
    }
  }

  saveNotes(day: any): void {
    if (!this.employmentData?.employment.shifts) {
      return;
    }

    const newNotes = (day.editingNotes || '').trim();

    // Find all shifts for this day
    const dayShifts = this.employmentData.employment.shifts.filter((shift: any) => {
      return shift.date === day.date.toISOString().slice(0, 10);
    });

    if (dayShifts.length === 0) {
      // No shifts for this day, cannot save notes
      this.cancelEditingNotes(day);
      return;
    }

    // Update the first shift's description for this day
    const targetShift = dayShifts[0];
    const shiftId = targetShift.id;

    if (!shiftId) {
      console.error('Shift ID not found');
      this.cancelEditingNotes(day);
      return;
    }

    // Prepare the update payload
    const updatePayload = {
      shift: {
        description: newNotes
      }
    };

    // Call the shifts service to update the shift
    this.shiftsService.shiftsIdPatch(shiftId, updatePayload).subscribe({
      next: (response) => {
        // Update the local data
        targetShift.description = newNotes;
        day.notes = newNotes;
        day.isEditing = false;
        day.editingNotes = '';

        // Refresh the weekly table to reflect changes
        this.updateWeeklyTable();

        console.log('Notes updated successfully');
      },
      error: (error) => {
        console.error('Error updating notes:', error);
        // Reset editing state on error
        this.cancelEditingNotes(day);
        // You might want to show a user-friendly error message here
      }
    });
  }
}
