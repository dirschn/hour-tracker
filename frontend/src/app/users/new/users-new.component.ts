import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

// Import the generated service and models
import { UsersService } from '../../../generated-api/api/users.service';
import { UsersPostRequest, UsersIdPutRequest } from '../../../generated-api/model/models';

// Import the shared form component
import { UserFormComponent } from '../components/user-form.component';

@Component({
  selector: 'app-users-new',
  standalone: true,
  imports: [CommonModule, RouterModule, UserFormComponent],
  templateUrl: './users-new.component.html',
  styleUrls: ['./users-new.component.scss']
})
export class UsersNewComponent {
  // Inject services
  private usersService = inject(UsersService);
  private router = inject(Router);

  // Component state
  loading = false;
  error: string | null = null;

  /**
   * Handle form submission from the child component
   */
  onFormSubmit(userData: UsersPostRequest | UsersIdPutRequest): void {
    this.loading = true;
    this.error = null;

    // Cast to UsersPostRequest since we know this is the create scenario
    const createData = userData as UsersPostRequest;

    this.usersService.usersPost(createData).pipe(
      catchError((error) => {
        console.error('Error creating user:', error);
        this.error = 'Failed to create user. Please try again.';
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
