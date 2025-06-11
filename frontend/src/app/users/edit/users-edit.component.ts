import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

// Import the generated service and models
import { UsersService } from '../../../generated-api/api/users.service';
import { UsersGet200ResponseInner, UsersIdPutRequest } from '../../../generated-api/model/models';

// Import the shared form component
import { UserFormComponent } from '../components/user-form.component';

@Component({
  selector: 'app-users-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, UserFormComponent],
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.scss']
})
export class UsersEditComponent implements OnInit {
  // Inject services
  private usersService = inject(UsersService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Component state
  loading = false;
  error: string | null = null;
  userId: string | null = null;
  user: UsersGet200ResponseInner | null = null;

  ngOnInit(): void {
    this.loadUser();
  }

  /**
   * Load user data from the route parameter
   */
  loadUser(): void {
    this.loading = true;
    this.error = null;

    this.route.paramMap.pipe(
      switchMap(params => {
        this.userId = params.get('id');
        if (!this.userId) {
          throw new Error('User ID not found');
        }
        return this.usersService.usersIdGet(this.userId);
      }),
      catchError((error) => {
        console.error('Error loading user:', error);
        this.error = 'Failed to load user. Please try again.';
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (user) => {
        if (user) {
          this.user = user as UsersGet200ResponseInner;
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
  onFormSubmit(userData: UsersIdPutRequest): void {
    if (!this.userId) return;

    this.loading = true;
    this.error = null;

    this.usersService.usersIdPut(this.userId, userData).pipe(
      catchError((error) => {
        console.error('Error updating user:', error);
        this.error = 'Failed to update user. Please try again.';
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          // Navigate back to users index on success
          this.router.navigate(['/users']);
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
    this.router.navigate(['/users']);
  }
}
