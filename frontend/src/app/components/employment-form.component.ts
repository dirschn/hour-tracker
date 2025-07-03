import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmploymentsService } from '../../generated-api/api/employments.service';
import { ProfilesService } from '../../generated-api/api/profiles.service';
import {
  Employment,
  EmploymentCreateRequest,
  EmploymentUpdateRequest,
  Company,
  Position,
  ProfileResponseFormData
} from '../../generated-api/model/models';

@Component({
  selector: 'app-employment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
                <!-- Company Selection/Creation -->
                <div class="card mb-4">
                  <div class="card-header">
                    <h5 class="mb-0">Company</h5>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="companyInput" class="form-label">Company Name <span class="text-danger">*</span></label>
                      <div class="position-relative">
                        <input
                          type="text"
                          class="form-control"
                          id="companyInput"
                          formControlName="companyName"
                          [class.is-invalid]="isFieldInvalid('companyName')"
                          placeholder="Type company name or select from existing..."
                          autocomplete="off"
                          (input)="onCompanyInput($event)"
                          (focus)="showCompanyDropdown = true"
                          (blur)="onCompanyBlur()">

                        <!-- Company Dropdown -->
                        <div *ngIf="showCompanyDropdown && filteredCompanies.length"
                             class="dropdown-menu show position-absolute w-100"
                             style="max-height: 200px; overflow-y: auto; z-index: 1000;">
                          <button
                            type="button"
                            class="dropdown-item"
                            *ngFor="let company of filteredCompanies"
                            (mousedown)="selectCompany(company)">
                            <strong>{{ company.name }}</strong>
                            <small class="d-block text-muted" *ngIf="company.description">{{ company.description }}</small>
                          </button>
                        </div>

                        <div class="invalid-feedback">
                          Company name is required.
                        </div>
                      </div>
                    </div>

                    <div class="mb-3" *ngIf="!selectedCompany">
                      <label for="companyDescription" class="form-label">Company Description</label>
                      <textarea
                        class="form-control"
                        id="companyDescription"
                        formControlName="companyDescription"
                        rows="2"
                        placeholder="Brief description of the company (optional for new companies)"></textarea>
                      <small class="form-text text-muted">
                        <i class="bi bi-info-circle me-1"></i>
                        You're creating a new company. This will be added to the system.
                      </small>
                    </div>

                    <!-- Selected Company Info -->
                    <div *ngIf="selectedCompany" class="alert alert-info">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{{ selectedCompany.name }}</strong>
                          <p class="mb-0" *ngIf="selectedCompany.description">{{ selectedCompany.description }}</p>
                        </div>
                        <button type="button" class="btn-close" (click)="clearCompanySelection()"></button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Position Selection/Creation -->
                <div class="card mb-4">
                  <div class="card-header">
                    <h5 class="mb-0">Position</h5>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="positionInput" class="form-label">Position Title <span class="text-danger">*</span></label>
                      <div class="position-relative">
                        <input
                          type="text"
                          class="form-control"
                          id="positionInput"
                          formControlName="positionTitle"
                          [class.is-invalid]="isFieldInvalid('positionTitle')"
                          placeholder="Type position title or select from existing..."
                          autocomplete="off"
                          (input)="onPositionInput($event)"
                          (focus)="showPositionDropdown = true"
                          (blur)="onPositionBlur()">

                        <!-- Position Dropdown -->
                        <div *ngIf="showPositionDropdown && filteredPositions.length"
                             class="dropdown-menu show position-absolute w-100"
                             style="max-height: 200px; overflow-y: auto; z-index: 1000;">
                          <button
                            type="button"
                            class="dropdown-item"
                            *ngFor="let position of filteredPositions"
                            (mousedown)="selectPosition(position)">
                            <div class="d-flex justify-content-between align-items-start">
                              <div>
                                <strong>{{ position.title }}</strong>
                                <small class="d-block text-muted">{{ getCompanyById(position.company_id)?.name }}</small>
                                <small class="d-block text-muted" *ngIf="position.description">{{ position.description }}</small>
                              </div>
                              <span class="badge bg-success ms-2" *ngIf="position.remote">Remote</span>
                            </div>
                          </button>
                        </div>

                        <div class="invalid-feedback">
                          Position title is required.
                        </div>
                      </div>
                    </div>

                    <div *ngIf="!selectedPosition">
                      <div class="mb-3">
                        <label for="positionDescription" class="form-label">Position Description</label>
                        <textarea
                          class="form-control"
                          id="positionDescription"
                          formControlName="positionDescription"
                          rows="3"
                          placeholder="Description of your role and responsibilities (optional)"></textarea>
                      </div>

                      <div class="mb-3">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="remote"
                            formControlName="isRemote">
                          <label class="form-check-label" for="remote">
                            Remote Position
                          </label>
                        </div>
                      </div>

                      <small class="form-text text-muted">
                        <i class="bi bi-info-circle me-1"></i>
                        You're creating a new position{{ selectedCompany ? ' for ' + selectedCompany.name : '' }}. This will be added to the system.
                      </small>
                    </div>

                    <!-- Selected Position Info -->
                    <div *ngIf="selectedPosition" class="alert alert-info">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 class="mb-1">{{ selectedPosition.title }}</h6>
                          <p class="mb-1"><strong>Company:</strong> {{ getCompanyById(selectedPosition.company_id)?.name }}</p>
                          <p class="mb-1" *ngIf="selectedPosition.description"><strong>Description:</strong> {{ selectedPosition.description }}</p>
                          <span class="badge bg-success" *ngIf="selectedPosition.remote">Remote Position</span>
                        </div>
                        <button type="button" class="btn-close" (click)="clearPositionSelection()"></button>
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

  // Form data from API - using generated types
  formData: ProfileResponseFormData = { companies: [], positions: [] };

  // Autocomplete state
  filteredCompanies: Company[] = [];
  filteredPositions: Position[] = [];
  showCompanyDropdown = false;
  showPositionDropdown = false;

  // Selected items
  selectedCompany: Company | null = null;
  selectedPosition: Position | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private employmentsService: EmploymentsService,
    private profilesService: ProfilesService
  ) {
    this.employmentForm = this.createForm();
  }

  ngOnInit() {
    this.employmentId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.employmentId;

    this.loadFormData();

    if (this.isEditMode) {
      this.loadEmployment();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      start_date: ['', Validators.required],
      end_date: [''],
      companyName: ['', Validators.required],
      companyDescription: [''],
      positionTitle: ['', Validators.required],
      positionDescription: [''],
      isRemote: [false]
    });
  }

  private loadFormData() {
    this.profilesService.profileGet().subscribe({
      next: (response: any) => {
        if (response.form_data) {
          this.formData = response.form_data;
          this.filteredCompanies = [...this.formData.companies];
          this.filteredPositions = [...this.formData.positions];
        }
      },
      error: (error) => {
        console.error('Error loading form data:', error);
      }
    });
  }

  // Helper method to get company by ID
  getCompanyById(companyId: number): Company | undefined {
    return this.formData.companies.find(c => c.id === companyId);
  }

  onCompanyInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.selectedCompany = null;
    this.clearPositionSelection();

    if (value.trim()) {
      this.filteredCompanies = this.formData.companies.filter(company =>
        company.name.toLowerCase().includes(value)
      );
    } else {
      this.filteredCompanies = [...this.formData.companies];
    }

    this.showCompanyDropdown = true;
    this.updatePositionOptions();
  }

  onPositionInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.selectedPosition = null;

    if (value.trim()) {
      let positions = this.formData.positions;

      // If a company is selected, filter positions for that company
      if (this.selectedCompany) {
        positions = positions.filter(p => p.company_id === this.selectedCompany!.id);
      }

      this.filteredPositions = positions.filter(position =>
        position.title.toLowerCase().includes(value)
      );
    } else {
      this.updatePositionOptions();
    }

    this.showPositionDropdown = true;
  }

  selectCompany(company: Company) {
    this.selectedCompany = company;
    this.employmentForm.patchValue({
      companyName: company.name,
      companyDescription: company.description || ''
    });
    this.showCompanyDropdown = false;
    this.clearPositionSelection();
    this.updatePositionOptions();
  }

  selectPosition(position: Position) {
    this.selectedPosition = position;
    this.employmentForm.patchValue({
      positionTitle: position.title,
      positionDescription: position.description || '',
      isRemote: position.remote || false
    });
    this.showPositionDropdown = false;

    // Also set the company if not already selected
    if (!this.selectedCompany) {
      const company = this.getCompanyById(position.company_id);
      if (company) {
        this.selectCompany(company);
      }
    }
  }

  clearCompanySelection() {
    this.selectedCompany = null;
    this.employmentForm.patchValue({
      companyName: '',
      companyDescription: ''
    });
    this.clearPositionSelection();
    this.updatePositionOptions();
  }

  clearPositionSelection() {
    this.selectedPosition = null;
    this.employmentForm.patchValue({
      positionTitle: '',
      positionDescription: '',
      isRemote: false
    });
    this.updatePositionOptions();
  }

  private updatePositionOptions() {
    if (this.selectedCompany) {
      this.filteredPositions = this.formData.positions.filter(p =>
        p.company_id === this.selectedCompany!.id
      );
    } else {
      this.filteredPositions = [...this.formData.positions];
    }
  }

  onCompanyBlur() {
    setTimeout(() => {
      this.showCompanyDropdown = false;
    }, 200);
  }

  onPositionBlur() {
    setTimeout(() => {
      this.showPositionDropdown = false;
    }, 200);
  }

  private loadEmployment() {
    if (!this.employmentId) return;

    this.isLoading = true;
    this.employmentsService.employmentsIdGet(this.employmentId).subscribe({
      next: (employment: any) => {
        this.employmentForm.patchValue({
          start_date: employment.start_date,
          end_date: employment.end_date || '',
          companyName: employment.company?.name || '',
          companyDescription: employment.company?.description || '',
          positionTitle: employment.position?.title || '',
          positionDescription: employment.position?.description || '',
          isRemote: employment.position?.remote !== undefined ? employment.position.remote : false
        });

        // Set selected company and position for editing
        if (employment.company) {
          this.selectedCompany = employment.company;
        }
        if (employment.position) {
          this.selectedPosition = employment.position;
        }

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
        employment: this.selectedPosition ? {
          position_id: this.selectedPosition.id,
          start_date: formData.start_date,
          end_date: formData.end_date || null
        } : {
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          position_attributes: {
            title: formData.positionTitle,
            description: formData.positionDescription,
            remote: formData.isRemote,
            company_attributes: {
              name: formData.companyName,
              description: formData.companyDescription
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
        employment: this.selectedPosition ? {
          position_id: this.selectedPosition.id,
          start_date: formData.start_date,
          end_date: formData.end_date || null
        } : {
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          position_attributes: {
            title: formData.positionTitle,
            description: formData.positionDescription,
            remote: formData.isRemote,
            company_attributes: {
              name: formData.companyName,
              description: formData.companyDescription
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
