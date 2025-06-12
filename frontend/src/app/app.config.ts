import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { Configuration, BASE_PATH } from '../generated-api';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { routes } from './app.routes';

// Create functional interceptor instead of class-based
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Clone the request and add credentials to include cookies
  const authReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we receive a 401 Unauthorized response, redirect to sign-in
      if (error.status === 401) {
        // Clear the current user state
        authService.clearUserState();
        // Redirect to sign-in page
        router.navigate(['/sign-in']);
      }

      // Re-throw the error so components can still handle it if needed
      return throwError(() => error);
    })
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // API Configuration
    { provide: BASE_PATH, useValue: 'http://localhost:3000' },
    {
      provide: Configuration,
      useFactory: () => new Configuration({
        basePath: 'http://localhost:3000',
      })
    }
  ]
};
