import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { AuthenticationService, LoginResponse, AuthenticatedUser, SignInPostRequest } from '../../generated-api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthenticatedUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private authenticationService: AuthenticationService) {
    // Check if user is already logged in on service initialization
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    // Check localStorage or make a request to verify current session
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  signIn(email: string, password: string): Observable<AuthenticatedUser> {
    const signInRequest: SignInPostRequest = {
      user: {
        email,
        password
      }
    };

    return this.authenticationService.signInPost(signInRequest).pipe(
      map((response: LoginResponse) => response.user),
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Sign in failed:', error);
        throw error;
      })
    );
  }

  signOut(): Observable<any> {
    return this.authenticationService.signOutDelete().pipe(
      tap(() => {
        this.clearUserState();
      }),
      catchError(error => {
        // Even if the API call fails, clear local state
        this.clearUserState();
        return of(null);
      })
    );
  }

  clearUserState(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
