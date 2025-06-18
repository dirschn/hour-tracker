import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AuthenticatedUser } from '../generated-api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'frontend';
  errorMessage = '';
  currentUser: AuthenticatedUser | null = null;
  isAuthenticated = false; // Cached authentication state

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = user !== null; // Update cached state
    });
  }

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/sign_in']);
      },
      error: (error) => {
        console.error('Sign out error:', error);
        this.router.navigate(['/sign_in']);
      }
    });
  }
}
