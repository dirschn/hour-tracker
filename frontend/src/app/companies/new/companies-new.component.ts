import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

// Import the generated service and models
import { CompaniesService } from '../../../generated-api/api/companies.service';
import { CompaniesPostRequest, CompaniesIdPutRequest } from '../../../generated-api/model/models';

// Import the shared form component
import { CompanyFormComponent } from '../components/company-form.component';
// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-companies-new',
  standalone: true,
  imports: [CommonModule, RouterModule, CompanyFormComponent, PageHeaderComponent],
  templateUrl: './companies-new.component.html',
  styleUrls: ['./companies-new.component.scss']
})
export class CompaniesNewComponent {
  // Inject services
  private companiesService = inject(CompaniesService);
  private router = inject(Router);

  // Component state
  loading = false;
  error: string | null = null;

  /**
   * Handle form submission from the child component
   */
  onFormSubmit(companyData: CompaniesPostRequest | CompaniesIdPutRequest): void {
    this.loading = true;
    this.error = null;

    // Cast to CompaniesPostRequest since we know this is the create scenario
    const createData = companyData as CompaniesPostRequest;

    this.companiesService.companiesPost(createData).pipe(
      catchError((error) => {
        console.error('Error creating company:', error);
        this.error = 'Failed to create company. Please try again.';
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          // Navigate back to companies index on success
          this.router.navigate(['/companies']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Handle form cancellation from the child component
   */
  onFormCancel(): void {
    this.router.navigate(['/companies']);
  }
}
