import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

// Import the generated service and models
import { CompaniesService } from '../../../generated-api/api/companies.service';
import { CompaniesGet200ResponseInner, CompaniesIdPutRequest } from '../../../generated-api/model/models';

// Import the shared form component
import { CompanyFormComponent } from '../components/company-form.component';
// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-companies-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, CompanyFormComponent, PageHeaderComponent],
  templateUrl: './companies-edit.component.html',
  styleUrls: ['./companies-edit.component.scss']
})
export class CompaniesEditComponent implements OnInit {
  // Inject services
  private companiesService = inject(CompaniesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Component state
  loading = false;
  error: string | null = null;
  companyId: string | null = null;
  company: CompaniesGet200ResponseInner | null = null;

  ngOnInit(): void {
    this.loadCompany();
  }

  /**
   * Load company data from the route parameter
   */
  loadCompany(): void {
    this.loading = true;
    this.error = null;

    this.route.paramMap.pipe(
      switchMap(params => {
        this.companyId = params.get('id');
        if (!this.companyId) {
          throw new Error('Company ID not found');
        }
        return this.companiesService.companiesIdGet(this.companyId);
      }),
      catchError((error) => {
        console.error('Error loading company:', error);
        this.error = 'Failed to load company. Please try again.';
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (company) => {
        if (company) {
          this.company = company as CompaniesGet200ResponseInner;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Handle form submission from the child component
   */
  onFormSubmit(companyData: CompaniesIdPutRequest): void {
    if (!this.companyId) return;

    this.loading = true;
    this.error = null;

    this.companiesService.companiesIdPut(this.companyId, companyData).pipe(
      catchError((error) => {
        console.error('Error updating company:', error);
        this.error = 'Failed to update company. Please try again.';
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
