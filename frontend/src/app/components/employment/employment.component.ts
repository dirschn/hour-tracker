import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmploymentsService, EmploymentResponse, ShiftsService } from '../../../generated-api';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-employment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FullCalendarModule],
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.css']
})
export class EmploymentComponent implements OnInit {
  employmentData: EmploymentResponse | null = null;
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
          this.updateCalendarEvents();
        },
        error: (error) => {
          console.error('Error loading employment details:', error);
        }
      });
    }
  }

  updateCalendarEvents(): void {
    if (!this.employmentData?.employment.shifts || this.employmentData.employment.shifts.length === 0) {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: []
      };
      return;
    }

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

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };

    console.log('Calendar events updated with', events.length, 'events');
  }

  handleEventClick(info: EventClickArg): void {
    // Navigate directly to shift edit when clicking on a shift
    const currentPath = this.router.url.split('?')[0]; // Remove any existing query params
    this.router.navigate([`/shifts/${info.event.extendedProps['id']}/edit`], {
      queryParams: { returnUrl: currentPath }
    });
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

  copyTableToClipboard(format: 'markdown' | 'teams' | 'plain' = 'markdown'): void {
    let tableText = '';
    
    // Collect notes for separate list
    let notesList: string[] = [];

    this.weeklyTableData.forEach((day) => {
      // Collect notes if they exist
      if (day.notes && day.notes.trim() && day.notes !== '-') {
        notesList.push(day.notes.trim());
      }
    });

    switch (format) {
      case 'markdown':
        tableText = this.generateMarkdownTable(notesList);
        break;
      case 'teams':
        tableText = this.generateTeamsTable(notesList);
        break;
      case 'plain':
        tableText = this.generatePlainTextTable(notesList);
        break;
    }

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tableText).then(() => {
        console.log(`Table copied to clipboard as ${format}`);
      }).catch(err => {
        console.error('Failed to copy table to clipboard', err);
        this.fallbackCopyToClipboard(tableText);
      });
    } else {
      this.fallbackCopyToClipboard(tableText);
    }
  }

  private generateMarkdownTable(notesList: string[]): string {
    // Create markdown table without notes column
    let markdownTable = '| Date | Hours | Times |\n';
    markdownTable += '|------|-------|-------|\n';

    this.weeklyTableData.forEach((day) => {
      const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const times = day.times || '-';
      markdownTable += `| ${date} | ${day.hours} | ${times} |\n`;
    });

    markdownTable += `| **Total** | **${this.getTotalHours()}** | **-** |\n`;

    // Add notes as unordered list if any exist
    if (notesList.length > 0) {
      markdownTable += '\n';
      notesList.forEach(note => {
        markdownTable += `${note}\n`;
      });
    }

    return markdownTable;
  }

  private generateTeamsTable(notesList: string[]): string {
    // Create tab-separated values table for Teams
    let teamsTable = 'Date\tHours\tTimes\n';

    this.weeklyTableData.forEach((day) => {
      const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const times = day.times || '-';
      teamsTable += `${date}\t${day.hours}\t${times}\n`;
    });

    teamsTable += `Total\t${this.getTotalHours()}\t-\n`;

    // Add notes as separate lines if any exist
    if (notesList.length > 0) {
      teamsTable += '\nNotes:\n';
      notesList.forEach(note => {
        teamsTable += `• ${note}\n`;
      });
    }

    return teamsTable;
  }

  private generatePlainTextTable(notesList: string[]): string {
    // Create plain text table with fixed-width columns
    const dateWidth = 12;
    const hoursWidth = 8;
    const timesWidth = 20;

    let plainTable = '';
    plainTable += 'Date'.padEnd(dateWidth) + 'Hours'.padEnd(hoursWidth) + 'Times'.padEnd(timesWidth) + '\n';
    plainTable += '-'.repeat(dateWidth) + '-'.repeat(hoursWidth) + '-'.repeat(timesWidth) + '\n';

    this.weeklyTableData.forEach((day) => {
      const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const times = day.times || '-';
      plainTable += date.padEnd(dateWidth) + day.hours.padEnd(hoursWidth) + times.padEnd(timesWidth) + '\n';
    });

    plainTable += '-'.repeat(dateWidth) + '-'.repeat(hoursWidth) + '-'.repeat(timesWidth) + '\n';
    plainTable += 'Total'.padEnd(dateWidth) + this.getTotalHours().padEnd(hoursWidth) + '-'.padEnd(timesWidth) + '\n';

    // Add notes if any exist
    if (notesList.length > 0) {
      plainTable += '\nNotes:\n';
      notesList.forEach(note => {
        plainTable += `• ${note}\n`;
      });
    }

    return plainTable;
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
