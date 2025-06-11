import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

// Import the generated service and models
import { UsersService } from '../../../generated-api/api/users.service';
import { UsersGet200ResponseInner, UsersPostRequest } from '../../../generated-api/model/models';

// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-users-index',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  templateUrl: './users-index.component.html',
  styleUrls: ['./users-index.component.scss']
})
export class UsersIndexComponent implements OnInit {
  // Inject the generated service
  private usersService = inject(UsersService);
  private router = inject(Router);

  // Component state
  users$: Observable<UsersGet200ResponseInner[]> = of([]);
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load all users using the generated service
   */
  loadUsers(): void {
    this.loading = true;
    this.error = null;

    // Use the generated service method with proper typing
    this.users$ = this.usersService.usersGet().pipe(
      catchError((error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        return of([]);
      })
    );

    // Handle loading state
    this.users$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Delete a user using the generated service
   */
  deleteUser(userId: string): void {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.usersService.usersIdDelete(userId).pipe(
      catchError((error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
        return of(null);
      })
    ).subscribe({
      next: () => {
        // Reload users after successful deletion
        this.loadUsers();
      }
    });
  }

  /**
   * Navigate to user edit page
   */
  editUser(userId: string): void {
    this.router.navigate(['/users', userId, 'edit']);
  }

  /**
   * Track by function for ngFor performance
   */
  trackByUserId(index: number, user: UsersGet200ResponseInner): any {
    return user.id || index;
  }
}
