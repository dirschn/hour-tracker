import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmploymentsService } from '../../generated-api/api/employments.service';
import { Employment, EmploymentCreateRequest, EmploymentUpdateRequest } from '../../generated-api/model/models';

@Component({
  selector: 'app-employment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">
                <i class="bi bi-briefcase me-2"></i>
                {{ isEditMode ? 'Edit Employment' : 'New Employment' }}
              </h3>
            </div>
            <div class="card-body">
              <form [formGroup]="employmentForm" (ngSubmit)="onSubmit()">
                <!-- Company Information -->
                <div class="card mb-4">
                  <div class="card-header">
                    <h5 class="mb-0">Company Information</h5>
                  </div>
                  <div class="card-body" formGroupName="position">
                    <div formGroupName="company">
                      <div class="mb-3">
                        <label for="companyName" class="form-label">Company Name <span class="text-danger">*</span></label>
                        <input
                          type="text"
                          class="form-control"
                          id="companyName"
                          formControlName="name"
                          [class.is-invalid]="isFieldInvalid('position.company.name')"
                          placeholder="Enter company name">
                        <div class="invalid-feedback">
                          Company name is required.
                        </div>
                      </div>

                      <div class="mb-3">
                        <label for="companyDescription" class="form-label">Company Description</label>
                        <textarea
                          class="form-control"
                          id="companyDescription"
                          formControlName="description"
                          rows="3"
                          placeholder="Brief description of the company (optional)"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Position Information -->
                <div class="card mb-4">
                  <div class="card-header">
                    <h5 class="mb-0">Position Information</h5>
                  </div>
                  <div class="card-body" formGroupName="position">
                    <div class="mb-3">
                      <label for="positionTitle" class="form-label">Position Title <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        id="positionTitle"
                        formControlName="title"
                        [class.is-invalid]="isFieldInvalid('position.title')"
                        placeholder="Enter position title">
                      <div class="invalid-feedback">
                        Position title is required.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="positionDescription" class="form-label">Position Description</label>
                      <textarea
                        class="form-control"
                        id="positionDescription"
                        formControlName="description"
                        rows="3"
                        placeholder="Description of your role and responsibilities (optional)"></textarea>
                    </div>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="remote"
                          formControlName="remote">
                        <label class="form-check-label" for="remote">
                          Remote Position
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Employment Dates -->
                <div class="card mb-4">
                  <div class="card-header">
                    <h5 class="mb-0">Employment Period</h5>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="startDate" class="form-label">Start Date <span class="text-danger">*</span></label>
                          <input
                            type="date"
                            class="form-control"
                            id="startDate"
                            formControlName="start_date"
                            [class.is-invalid]="isFieldInvalid('start_date')">
                          <div class="invalid-feedback">
                            Start date is required.
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="endDate" class="form-label">End Date</label>
                          <input
                            type="date"
                            class="form-control"
                            id="endDate"
                            formControlName="end_date"
                            [class.is-invalid]="isFieldInvalid('end_date')">
                          <small class="form-text text-muted">Leave blank if currently employed</small>
                          <div class="invalid-feedback">
                            End date must be after start date.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    [disabled]="isLoading || employmentForm.invalid">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!isLoading" class="bi bi-check-lg me-2"></i>
                    {{ isEditMode ? 'Update Employment' : 'Create Employment' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmploymentFormComponent implements OnInit {
  employmentForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  employmentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private employmentsService: EmploymentsService
  ) {
    this.employmentForm = this.createForm();
  }

  ngOnInit() {
    this.employmentId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.employmentId;

    if (this.isEditMode) {
      this.loadEmployment();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      start_date: ['', Validators.required],
      end_date: [''],
      position: this.fb.group({
        title: ['', Validators.required],
        description: [''],
        remote: [false], // Default to false instead of true
        company: this.fb.group({
          name: ['', Validators.required],
          description: ['']
        })
      })
    });
  }

  private loadEmployment() {
    if (!this.employmentId) return;

    this.isLoading = true;
    this.employmentsService.employmentsIdGet(this.employmentId).subscribe({
      next: (employment: any) => {
        // The API returns nested company and position data for editing
        this.employmentForm.patchValue({
          start_date: employment.start_date,
          end_date: employment.end_date || '',
          position: {
            title: employment.position?.title || '',
            description: employment.position?.description || '',
            remote: employment.position?.remote !== undefined ? employment.position.remote : false, // Properly handle boolean values
            company: {
              name: employment.company?.name || '',
              description: employment.company?.description || ''
            }
          }
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load employment data.';
        this.isLoading = false;
        console.error('Error loading employment:', error);
      }
    });
  }

  onSubmit() {
    if (this.employmentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = this.employmentForm.value;

    if (this.isEditMode && this.employmentId) {
      const request: EmploymentUpdateRequest = {
        employment: {
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          position_attributes: {
            title: formData.position.title,
            description: formData.position.description,
            remote: formData.position.remote,
            company_attributes: {
              name: formData.position.company.name,
              description: formData.position.company.description
            }
          }
        }
      };

      this.employmentsService.employmentsIdPatch(this.employmentId, request).subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (error: any) => {
          this.handleError(error);
        }
      });
    } else {
      const request: EmploymentCreateRequest = {
        employment: {
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          position_attributes: {
            title: formData.position.title,
            description: formData.position.description,
            remote: formData.position.remote,
            company_attributes: {
              name: formData.position.company.name,
              description: formData.position.company.description
            }
          }
        }
      };

      this.employmentsService.employmentsPost(request).subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (error: any) => {
          this.handleError(error);
        }
      });
    }
  }

  private handleError(error: any) {
    this.isLoading = false;
    if (error?.error?.errors) {
      this.errorMessage = error.error.errors.join(', ');
    } else {
      this.errorMessage = 'An error occurred while saving the employment.';
    }
    console.error('Error saving employment:', error);
  }

  private markFormGroupTouched() {
    Object.keys(this.employmentForm.controls).forEach(key => {
      const control = this.employmentForm.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched();
        }
      }
    });
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.employmentForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}
