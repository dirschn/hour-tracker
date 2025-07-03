import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, fromEvent, map, take } from 'rxjs';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installPromptSubject = new BehaviorSubject<boolean>(false);
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);

  public installPromptAvailable$ = this.installPromptSubject.asObservable();
  public updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor(private swUpdate: SwUpdate) {
    this.initializePwa();
    this.checkForUpdates();
  }

  private initializePwa(): void {
    // Listen for the beforeinstallprompt event
    fromEvent(window, 'beforeinstallprompt')
      .pipe(take(1))
      .subscribe((event: Event) => {
        event.preventDefault();
        this.deferredPrompt = event as BeforeInstallPromptEvent;
        this.installPromptSubject.next(true);
      });

    // Listen for app installation
    fromEvent(window, 'appinstalled').subscribe(() => {
      this.deferredPrompt = null;
      this.installPromptSubject.next(false);
      this.showInstallSuccessMessage();
    });
  }

  private checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      // Check for updates
      this.swUpdate.versionUpdates
        .subscribe(evt => {
          if (evt.type === 'VERSION_READY') {
            this.updateAvailableSubject.next(true);
            this.showUpdateAvailableNotification();
          }
        });

      // Check for updates every 6 hours
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 6 * 60 * 60 * 1000);
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.installPromptSubject.next(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    }
  }

  public async updateApp(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      try {
        await this.swUpdate.activateUpdate();
        window.location.reload();
      } catch (error) {
        console.error('Error updating app:', error);
      }
    }
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  public isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  private showInstallSuccessMessage(): void {
    this.showNotification('Hour Tracker installed successfully!', 'success');
  }

  private showUpdateAvailableNotification(): void {
    this.showNotification('A new version is available. Click to update.', 'info', () => {
      this.updateApp();
    });
  }

  private showNotification(message: string, type: 'success' | 'info' | 'warning' = 'info', action?: () => void): void {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'} alert-dismissible position-fixed`;
    notification.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 350px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2"></i>
        <span class="flex-grow-1">${message}</span>
        ${action ? '<button type="button" class="btn btn-sm btn-outline-primary ms-2">Update</button>' : ''}
        <button type="button" class="btn-close ms-2" aria-label="Close"></button>
      </div>
    `;

    // Add click handlers
    const updateBtn = notification.querySelector('.btn-outline-primary');
    const closeBtn = notification.querySelector('.btn-close');

    if (updateBtn && action) {
      updateBtn.addEventListener('click', action);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => notification.remove());
    }

    // Auto-remove after 5 seconds if no action
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    document.body.appendChild(notification);
  }

  public getInstallInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'Tap the install button or look for "Install Hour Tracker" in your browser menu.';
    } else if (userAgent.includes('firefox')) {
      return 'Look for the install icon in the address bar or browser menu.';
    } else if (userAgent.includes('safari')) {
      return 'Tap the share button and select "Add to Home Screen".';
    } else if (userAgent.includes('edg')) {
      return 'Click the install button or look for "Install Hour Tracker" in the browser menu.';
    }

    return 'Look for install options in your browser menu or address bar.';
  }
}
