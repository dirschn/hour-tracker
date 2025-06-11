import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Group {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Test backend health
  testHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/up`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      responseType: 'text' // Important: /up endpoint returns plain text, not JSON
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Health check error details:', error);
        console.log('Status:', error.status);
        console.log('Status text:', error.statusText);
        console.log('Error object:', error);

        // If it's a 304, treat it as success since the endpoint is responding
        if (error.status === 304) {
          return of('Backend responding (304 - Not Modified)');
        }

        // For other errors, re-throw
        throw error;
      })
    );
  }

  // Get all groups
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.baseUrl}/groups`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Groups fetch error:', error);

        // If it's a 304, return empty array as the cached data should be fine
        if (error.status === 304) {
          return of([]);
        }

        throw error;
      })
    );
  }

  // Create a new group
  createGroup(group: { name: string; description?: string }): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/groups`, group, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }
}
