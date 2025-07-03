import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ShiftsService, ShiftResponse, ShiftsIdPatchRequest } from '../../generated-api';

@Component({
  selector: 'app-shift-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Edit Shift</h1>
            <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
              <i class="bi bi-arrow-left me-2"></i>Back to Shift
            </button>
          </div>

          <div *ngIf="loading" class="d-flex justify-content-center py-5">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading shift...</span>
            </div>
          </div>

          <div *ngIf="!loading && shiftData">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-clock-history me-2"></i>
                  Shift Details
                </h5>
              </div>
              <div class="card-body">
                <form [formGroup]="shiftForm" (ngSubmit)="onSubmit()">
                  <!-- Date Field -->
                  <div class="mb-3">
                    <label for="date" class="form-label">Date <span class="text-danger">*</span></label>
                    <input
                      type="date"
                      id="date"
                      class="form-control"
                      formControlName="date"
                      [class.is-invalid]="isFieldInvalid('date')"
                    >
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('date')">
                      <div *ngIf="shiftForm.get('date')?.errors?.['required']">
                        Date is required
                      </div>
                    </div>
                  </div>

                  <!-- Start Time Field -->
                  <div class="mb-3">
                    <label for="startTime" class="form-label">Start Time <span class="text-danger">*</span></label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      class="form-control"
                      formControlName="startTime"
                      [class.is-invalid]="isFieldInvalid('startTime')"
                    >
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('startTime')">
                      <div *ngIf="shiftForm.get('startTime')?.errors?.['required']">
                        Start time is required
                      </div>
                    </div>
                  </div>

                  <!-- End Time Field -->
                  <div class="mb-3">
                    <label for="endTime" class="form-label">End Time</label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      class="form-control"
                      formControlName="endTime"
                      [class.is-invalid]="isFieldInvalid('endTime')"
                    >
                    <small class="form-text text-muted">Leave blank to keep shift active</small>
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('endTime')">
                      <div *ngIf="shiftForm.get('endTime')?.errors?.['invalidEndTime']">
                        End time must be after start time
                      </div>
                    </div>
                  </div>

                  <!-- Description Field -->
                  <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea
                      id="description"
                      class="form-control"
                      formControlName="description"
                      rows="3"
                      placeholder="Optional description of work performed during this shift"
                    ></textarea>
                    <small class="form-text text-muted">Add details about what was accomplished during this shift</small>
                  </div>

                  <!-- Error Messages -->
                  <div *ngIf="errorMessage" class="alert alert-danger mb-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    {{ errorMessage }}
                  </div>

                  <!-- Form Actions -->
                  <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-secondary" (click)="goBack()">
                      <i class="bi bi-arrow-left me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="saving || shiftForm.invalid">
                      <span *ngIf="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      <i *ngIf="!saving" class="bi bi-check-lg me-2"></i>
                      {{ saving ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="alert alert-success mt-4 alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" (click)="clearMessages()"></button>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="alert alert-danger mt-4 alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" (click)="clearMessages()"></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ShiftEditComponent implements OnInit {
  shiftForm: FormGroup;
  shiftData: ShiftResponse | null = null;
  shiftId!: number; // Use definite assignment assertion
  loading = true;
  saving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private shiftsService: ShiftsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.shiftForm = this.createForm();
  }

  ngOnInit(): void {
    const shiftIdParam = this.route.snapshot.params['id'];
    this.shiftId = parseInt(shiftIdParam, 10);

    if (isNaN(this.shiftId)) {
      this.errorMessage = 'Invalid shift ID';
      this.loading = false;
      return;
    }

    this.loadShift();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: [''],
      description: ['']
    }, { validators: this.endTimeValidator });
  }

  private endTimeValidator(form: FormGroup) {
    const startTime = form.get('startTime')?.value;
    const endTime = form.get('endTime')?.value;

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      form.get('endTime')?.setErrors({ invalidEndTime: true });
      return { invalidEndTime: true };
    }

    return null;
  }

  private loadShift(): void {
    this.loading = true;
    this.clearMessages();

    this.shiftsService.shiftsIdGet(this.shiftId).subscribe({
      next: (response: ShiftResponse) => {
        this.shiftData = response;
        this.populateForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load shift:', error);
        this.errorMessage = error?.error?.error || 'Failed to load shift data';
        this.loading = false;
      }
    });
  }

  private populateForm(): void {
    if (!this.shiftData?.shift) return;

    const shift = this.shiftData.shift;

    // Format date for input field (YYYY-MM-DD)
    const dateValue = shift.date;

    // Format datetime-local values (YYYY-MM-DDTHH:mm)
    const startTimeValue = this.formatDateTimeLocal(shift.start_time);
    const endTimeValue = shift.end_time ? this.formatDateTimeLocal(shift.end_time) : '';

    this.shiftForm.patchValue({
      date: dateValue,
      startTime: startTimeValue,
      endTime: endTimeValue,
      description: shift.description || ''
    });
  }

  private formatDateTimeLocal(dateTimeString: string): string {
    // Create a date object from the API datetime string
    const date = new Date(dateTimeString);

    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    // This uses the local timezone automatically
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private formatDateTimeForAPI(dateTimeLocal: string): string {
    // Convert datetime-local value to ISO string for API
    // datetime-local values are in local timezone, toISOString() converts to UTC
    const localDate = new Date(dateTimeLocal);
    return localDate.toISOString();
  }

  onSubmit(): void {
    if (this.shiftForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.clearMessages();

    const formData = this.shiftForm.value;

    const updateRequest: ShiftsIdPatchRequest = {
      shift: {
        date: formData.date,
        start_time: this.formatDateTimeForAPI(formData.startTime),
        end_time: formData.endTime ? this.formatDateTimeForAPI(formData.endTime) : null,
        employment_id: this.shiftData?.shift.employment_id,
        description: formData.description
      }
    };

    this.shiftsService.shiftsIdPatch(this.shiftId, updateRequest).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Shift updated successfully!';

        // Navigate back to shift view after a short delay
        setTimeout(() => {
          this.router.navigate(['/shifts', this.shiftId]);
        }, 1500);
      },
      error: (error) => {
        console.error('Failed to update shift:', error);
        this.saving = false;

        if (error?.error?.errors && Array.isArray(error.error.errors)) {
          this.errorMessage = error.error.errors.join(', ');
        } else {
          this.errorMessage = error?.error?.error || 'Failed to update shift';
        }
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.shiftForm.controls).forEach(key => {
      const control = this.shiftForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shiftForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  goBack(): void {
    this.router.navigate(['/shifts', this.shiftId]);
  }
}
