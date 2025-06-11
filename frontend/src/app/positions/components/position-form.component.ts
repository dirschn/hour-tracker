import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';

// Import the generated models
import { Position } from '../../../generated-api/model/position';
import { PositionsPostRequest, PositionsIdPutRequest } from '../../../generated-api/model/models';
import { Company } from '../../../generated-api/model/company';
import { CompaniesService } from '../../../generated-api/api/companies.service';

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './position-form.component.html',
  styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companiesService = inject(CompaniesService);

  @Input() position: Position | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() submitButtonText = 'Submit';

  @Output() formSubmit = new EventEmitter<PositionsPostRequest | PositionsIdPutRequest>();
  @Output() formCancel = new EventEmitter<void>();

  companies$: Observable<Company[]> = of([]);

  // Form with Rails convention field names
  positionForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    company_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // Load companies for the dropdown
    this.loadCompanies();

    // If editing an existing position, populate the form
    if (this.position) {
      this.positionForm.patchValue({
        title: this.position.title,
        company_id: this.position.company_id
      });
    }
  }

  /**
   * Load companies for the dropdown
   */
  loadCompanies(): void {
    this.companies$ = this.companiesService.companiesGet();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    // Structure data according to Rails convention
    const positionData = {
      position: this.positionForm.value
    };

    this.formSubmit.emit(positionData);
  }

  /**
   * Handle form cancellation
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Check if a form field has an error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.positionForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.positionForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }

    return 'Invalid input';
  }

  /**
   * Get display name for field
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'title': 'Title',
      'company_id': 'Company'
    };
    return displayNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
}
