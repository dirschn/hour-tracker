import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

// Import the generated service and models
import { PositionsService } from '../../../generated-api/api/positions.service';
import { Position } from '../../../generated-api/model/position';

// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-positions-index',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  templateUrl: './positions-index.component.html',
  styleUrls: ['./positions-index.component.scss']
})
export class PositionsIndexComponent implements OnInit {
  // Inject the generated service
  private positionsService = inject(PositionsService);
  private router = inject(Router);

  // Component state
  positions$: Observable<Position[]> = of([]);
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadPositions();
  }

  /**
   * Load all positions using the generated service
   */
  loadPositions(): void {
    this.loading = true;
    this.error = null;

    // Use the generated service method with proper typing
    this.positions$ = this.positionsService.positionsGet().pipe(
      catchError((error) => {
        console.error('Error loading positions:', error);
        this.error = 'Failed to load positions. Please try again.';
        this.loading = false;
        return of([]);
      })
    );

    // Handle loading state
    this.positions$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Delete a position using the generated service
   */
  deletePosition(positionId: string): void {
    if (!confirm('Are you sure you want to delete this position?')) {
      return;
    }

    this.positionsService.positionsIdDelete(positionId).pipe(
      catchError((error) => {
        console.error('Error deleting position:', error);
        alert('Failed to delete position. Please try again.');
        return of(null);
      })
    ).subscribe({
      next: () => {
        // Reload positions after successful deletion
        this.loadPositions();
      }
    });
  }

  /**
   * Navigate to position edit page
   */
  editPosition(positionId: string): void {
    this.router.navigate(['/positions', positionId, 'edit']);
  }

  /**
   * Track by function for ngFor performance
   */
  trackByPositionId(index: number, position: Position): any {
    return position.id || index;
  }
}
