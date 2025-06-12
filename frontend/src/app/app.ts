import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AuthenticatedUser } from '../generated-api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'frontend';
  errorMessage = '';
  currentUser: AuthenticatedUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/sign-in']);
      },
      error: (error) => {
        console.error('Sign out error:', error);
        this.router.navigate(['/sign-in']);
      }
    });
  }
}
