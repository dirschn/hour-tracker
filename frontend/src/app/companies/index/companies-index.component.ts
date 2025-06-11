import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

// Import the generated service and models
import { CompaniesService } from '../../../generated-api/api/companies.service';
import { Company } from '../../../generated-api/model/company';

// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-companies-index',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  templateUrl: './companies-index.component.html',
  styleUrls: ['./companies-index.component.scss']
})
export class CompaniesIndexComponent implements OnInit {
  // Inject the generated service
  private companiesService = inject(CompaniesService);
  private router = inject(Router);

  // Component state
  companies$: Observable<Company[]> = of([]);
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadCompanies();
  }

  /**
   * Load all companies using the generated service
   */
  loadCompanies(): void {
    this.loading = true;
    this.error = null;

    // Use the generated service method with proper typing
    this.companies$ = this.companiesService.companiesGet().pipe(
      catchError((error) => {
        console.error('Error loading companies:', error);
        this.error = 'Failed to load companies. Please try again.';
        this.loading = false;
        return of([]);
      })
    );

    // Handle loading state
    this.companies$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Delete a company using the generated service
   */
  deleteCompany(companyId: string): void {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    this.companiesService.companiesIdDelete(companyId).pipe(
      catchError((error) => {
        console.error('Error deleting company:', error);
        alert('Failed to delete company. Please try again.');
        return of(null);
      })
    ).subscribe({
      next: () => {
        // Reload companies after successful deletion
        this.loadCompanies();
      }
    });
  }

  /**
   * Navigate to company edit page
   */
  editCompany(companyId: string): void {
    this.router.navigate(['/companies', companyId, 'edit']);
  }

  /**
   * Track by function for ngFor performance
   */
  trackByCompanyId(index: number, company: Company): any {
    return company.id || index;
  }
}
