import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

// Import the generated service and models
import { PositionsService } from '../../../generated-api/api/positions.service';
import { Position } from '../../../generated-api/model/position';
import { PositionsIdPutRequest } from '../../../generated-api/model/models';

// Import the shared form component
import { PositionFormComponent } from '../components/position-form.component';
// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-positions-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, PositionFormComponent, PageHeaderComponent],
  templateUrl: './positions-edit.component.html',
  styleUrls: ['./positions-edit.component.scss']
})
export class PositionsEditComponent implements OnInit {
  // Inject services
  private positionsService = inject(PositionsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Component state
  loading = false;
  error: string | null = null;
  positionId: string | null = null;
  position: Position | null = null;

  ngOnInit(): void {
    this.loadPosition();
  }

  /**
   * Load position data from the route parameter
   */
  loadPosition(): void {
    this.loading = true;
    this.error = null;

    this.route.paramMap.pipe(
      switchMap(params => {
        this.positionId = params.get('id');
        if (!this.positionId) {
          throw new Error('Position ID not found');
        }
        return this.positionsService.positionsIdGet(this.positionId);
      }),
      catchError((error) => {
        console.error('Error loading position:', error);
        this.error = 'Failed to load position. Please try again.';
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (position) => {
        if (position) {
          this.position = position as Position;
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
  onFormSubmit(positionData: PositionsIdPutRequest): void {
    if (!this.positionId) return;

    this.loading = true;
    this.error = null;

    this.positionsService.positionsIdPut(this.positionId, positionData).pipe(
      catchError((error) => {
        console.error('Error updating position:', error);
        this.error = 'Failed to update position. Please try again.';
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
