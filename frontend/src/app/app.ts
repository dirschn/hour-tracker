import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { PwaService } from './services/pwa.service';
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
  showInstallPrompt = false;
  showUpdatePrompt = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private pwaService: PwaService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = user !== null; // Update cached state
    });

    // Subscribe to PWA events
    this.pwaService.installPromptAvailable$.subscribe(available => {
      this.showInstallPrompt = available && !this.pwaService.isStandalone();
    });

    this.pwaService.updateAvailable$.subscribe(available => {
      this.showUpdatePrompt = available;
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

  async installApp(): Promise<void> {
    const installed = await this.pwaService.installApp();
    if (installed) {
      this.showInstallPrompt = false;
    }
  }

  async updateApp(): Promise<void> {
    await this.pwaService.updateApp();
  }

  dismissInstallPrompt(): void {
    this.showInstallPrompt = false;
  }

  dismissUpdatePrompt(): void {
    this.showUpdatePrompt = false;
  }

  get isStandalone(): boolean {
    return this.pwaService.isStandalone();
  }

  get installInstructions(): string {
    return this.pwaService.getInstallInstructions();
  }
}
