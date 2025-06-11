import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Group {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  status: number;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams | { [key: string]: any }): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      headers: this.defaultHeaders,
      params: params
    };

    return this.http.get<T>(url, options).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = headers ? headers : this.defaultHeaders;

    return this.http.post<T>(url, data, { headers: requestHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = headers ? headers : this.defaultHeaders;

    return this.http.put<T>(url, data, { headers: requestHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = headers ? headers : this.defaultHeaders;

    return this.http.patch<T>(url, data, { headers: requestHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = headers ? headers : this.defaultHeaders;

    return this.http.delete<T>(url, { headers: requestHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let apiError: ApiError = {
      message: 'An unknown error occurred',
      status: 0
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError = {
        message: error.error.message,
        status: 0,
        error: error.error
      };
    } else {
      // Server-side error
      apiError = {
        message: error.error?.message || error.message || `Error ${error.status}`,
        status: error.status,
        error: error.error
      };
    }

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  };

  /**
   * Helper method to update base URL if needed
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}
