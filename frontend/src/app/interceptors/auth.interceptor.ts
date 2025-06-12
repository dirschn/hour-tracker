import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request and add credentials to include cookies
    const authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true // This ensures cookies are sent with requests
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we receive a 401 Unauthorized response, redirect to sign-in
        if (error.status === 401) {
          // Clear the current user state
          this.authService.clearUserState();
          // Redirect to sign-in page
          this.router.navigate(['/sign-in']);
        }

        // Re-throw the error so components can still handle it if needed
        return throwError(() => error);
      })
    );
  }
}
