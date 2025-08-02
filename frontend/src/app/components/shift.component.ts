import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ShiftsService, ShiftResponse } from '../../generated-api';

@Component({
  selector: 'app-shift',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div *ngIf="shiftData; else loading">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3">Shift Details</h1>
        </div>
        <!-- Shift Information Card -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-clock me-2"></i>
              Shift Information
            </h5>
          </div>
          <div class="card-body">
            <p><strong>Date:</strong> {{ shiftData.shift.date | date:'shortDate' }}</p>
            <p><strong>Start Time:</strong> {{ shiftData.shift.start_time | date:'shortTime' }}</p>
            <p><strong>End Time:</strong> {{ shiftData.shift.end_time ? (shiftData.shift.end_time | date:'shortTime') : 'Active' }}</p>
            <p><strong>Hours:</strong> {{ shiftData.shift.hours || 'N/A' }}</p>
            <p><strong>Status:</strong> {{ shiftData.shift.active ? 'Active' : 'Completed' }}</p>
            <div *ngIf="shiftData.shift.description" class="mb-0">
              <strong>Description:</strong>
              <div class="mt-1 p-2 bg-light rounded">{{ shiftData.shift.description }}</div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-end mb-3">
          <button type="button" class="btn btn-primary me-2" (click)="editShift()">
            <i class="bi bi-pencil me-2"></i>Edit
          </button>
          <button type="button" class="btn btn-danger" (click)="deleteShift()">
            <i class="bi bi-trash me-2"></i>Delete
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <ng-template #loading>
        <p>Loading shift details...</p>
      </ng-template>
    </div>
  `
})
export class ShiftComponent implements OnInit {
  shiftData: ShiftResponse | null = null;

  constructor(
    private shiftsService: ShiftsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadShiftDetails();
  }

  loadShiftDetails(): void {
    const shiftIdStr = this.router.url.split('/').pop();
    if (shiftIdStr) {
      const shiftId = parseInt(shiftIdStr, 10);
      if (!isNaN(shiftId)) {
        this.shiftsService.shiftsIdGet(shiftId).subscribe({
          next: (response: ShiftResponse) => {
            this.shiftData = response;
            console.log(this.shiftData);
          },
          error: (error: any) => {
            console.error('Error loading shift details:', error);
          }
        });
      }
    }
  }

  editShift(): void {
    if (this.shiftData?.shift.id) {
      // Get the returnUrl from query params, or use current route's referrer
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getReturnUrl();

      this.router.navigate(['/shifts', this.shiftData.shift.id, 'edit'], {
        queryParams: { returnUrl }
      });
    }
  }

  private getReturnUrl(): string {
    // Try to determine where the user came from based on the referrer
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;

    if (referrer.startsWith(currentOrigin)) {
      const referrerPath = new URL(referrer).pathname;

      // Check if it's from dashboard or employment page
      if (referrerPath === '/' || referrerPath === '/dashboard') {
        return '/';
      }
      if (referrerPath.startsWith('/employments/') && !referrerPath.includes('/edit')) {
        return referrerPath;
      }
    }

    // Default fallback to dashboard
    return '/';
  }

  deleteShift(): void {
    const shiftIdStr = this.router.url.split('/').pop();
    if (shiftIdStr && this.shiftData) {
      const shiftId = parseInt(shiftIdStr, 10);
      if (!isNaN(shiftId)) {
        if (confirm('Are you sure you want to delete this shift?')) {
          this.shiftsService.shiftsIdDelete(shiftId).subscribe({
            next: () => {
              console.log('Shift deleted successfully');
              this.router.navigate(['/dashboard']);
            },
            error: (error: any) => {
              console.error('Error deleting shift:', error);
            }
          });
        }
      }
    }
  }
}
