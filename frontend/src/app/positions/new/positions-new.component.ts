import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

// Import the generated service and models
import { PositionsService } from '../../../generated-api/api/positions.service';
import { PositionsPostRequest, PositionsIdPutRequest } from '../../../generated-api/model/models';

// Import the shared form component
import { PositionFormComponent } from '../components/position-form.component';
// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-positions-new',
  standalone: true,
  imports: [CommonModule, RouterModule, PositionFormComponent, PageHeaderComponent],
  templateUrl: './positions-new.component.html',
  styleUrls: ['./positions-new.component.scss']
})
export class PositionsNewComponent {
  // Inject services
  private positionsService = inject(PositionsService);
  private router = inject(Router);

  // Component state
  loading = false;
  error: string | null = null;

  /**
   * Handle form submission from the child component
   */
  onFormSubmit(positionData: PositionsPostRequest | PositionsIdPutRequest): void {
    this.loading = true;
    this.error = null;

    // Cast to PositionsPostRequest since we know this is the create scenario
    const createData = positionData as PositionsPostRequest;

    this.positionsService.positionsPost(createData).pipe(
      catchError((error) => {
        console.error('Error creating position:', error);
        this.error = 'Failed to create position. Please try again.';
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          // Navigate back to positions index on success
          this.router.navigate(['/positions']);
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
    this.router.navigate(['/positions']);
  }
}
