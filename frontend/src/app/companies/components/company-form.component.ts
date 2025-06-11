import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Import the generated models
import { CompaniesGet200ResponseInner, CompaniesPostRequest, CompaniesIdPutRequest } from '../../../generated-api/model/models';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() company: CompaniesGet200ResponseInner | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() submitButtonText = 'Submit';

  @Output() formSubmit = new EventEmitter<CompaniesPostRequest | CompaniesIdPutRequest>();
  @Output() formCancel = new EventEmitter<void>();

  // Form with Rails convention field names
  companyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  ngOnInit(): void {
    // If editing an existing company, populate the form
    if (this.company) {
      this.companyForm.patchValue({
        name: this.company.name,
        description: this.company.description
      });
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    // Structure data according to Rails convention
    const companyData = {
      company: this.companyForm.value
    };

    this.formSubmit.emit(companyData);
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
    const field = this.companyForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.companyForm.get(fieldName);
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
      'name': 'Name',
      'description': 'Description'
    };
    return displayNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
}
