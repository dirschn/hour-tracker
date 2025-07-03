import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EmploymentsService, EmploymentResponse } from '../../generated-api';

@Component({
  selector: 'app-employment',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  `
})
export class EmploymentComponent implements OnInit {
  employmentData: EmploymentResponse | null = null;

  constructor(private employmentsService: EmploymentsService, private router: Router) {}

  ngOnInit(): void {
    this.loadEmploymentDetails();
  }

  loadEmploymentDetails(): void {
    const employmentId = this.router.url.split('/').pop(); // Assuming the last part of the URL is the employment ID
    if (employmentId) {
      this.employmentsService.employmentsIdGet(employmentId).subscribe(
        response => {
          this.employmentData = response;
        },
        error => {
          console.error('Error loading employment details:', error);
        }
      );
    }
  }

  editEmployment(): void {
    const employmentId = this.router.url.split('/').pop();
    if (employmentId) {
      this.router.navigate(['/employments', employmentId, 'edit']);
    }
  }

  deleteEmployment(): void {
    const employmentId = this.router.url.split('/').pop();
    if (employmentId) {
      this.employmentsService.employmentsIdDelete(employmentId).subscribe(
        () => {
          this.router.navigate(['/employments']);
        },
        error => {
          console.error('Error deleting employment:', error);
        }
      );
    }
  }
}
