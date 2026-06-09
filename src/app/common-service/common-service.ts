import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Authguard } from '../authguard';
import { ConnectionService } from './connection-service';

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: any };
  skipSanitization?: boolean;
  skipAuth?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authGuard = inject(Authguard);
  private connectionService = inject(ConnectionService);

  // Base API URL can be updated to point to a specific environment API path
  private baseUrl = '';

  /**
   * Performs a secure GET request.
   */
  get<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const url = this.resolveUrl(endpoint);
    const httpOptions = this.prepareOptions(options, 'GET');
    return this.http.get<T>(url, httpOptions as { observe: 'body'; responseType: 'json' }).pipe(
      tap((response) => this.saveTokenIfPresent(response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Performs a secure POST request.
   */
  post<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    const url = this.resolveUrl(endpoint);
    const sanitizedBody = options.skipSanitization ? body : this.sanitize(body);
    const httpOptions = this.prepareOptions(options, 'POST');
    return this.http.post<T>(url, sanitizedBody, httpOptions as { observe: 'body'; responseType: 'json' }).pipe(
      tap((response) => this.saveTokenIfPresent(response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Performs a secure PUT request.
   */
  put<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    const url = this.resolveUrl(endpoint);
    const sanitizedBody = options.skipSanitization ? body : this.sanitize(body);
    const httpOptions = this.prepareOptions(options, 'PUT');
    return this.http.put<T>(url, sanitizedBody, httpOptions as { observe: 'body'; responseType: 'json' }).pipe(
      tap((response) => this.saveTokenIfPresent(response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Performs a secure PATCH request.
   */
  patch<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    const url = this.resolveUrl(endpoint);
    const sanitizedBody = options.skipSanitization ? body : this.sanitize(body);
    const httpOptions = this.prepareOptions(options, 'PATCH');
    return this.http.patch<T>(url, sanitizedBody, httpOptions as { observe: 'body'; responseType: 'json' }).pipe(
      tap((response) => this.saveTokenIfPresent(response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Performs a secure DELETE request.
   */
  delete<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    const url = this.resolveUrl(endpoint);
    const httpOptions = this.prepareOptions(options, 'DELETE');
    return this.http.delete<T>(url, httpOptions as { observe: 'body'; responseType: 'json' }).pipe(
      tap((response) => this.saveTokenIfPresent(response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Resolves the full URL.
   */
  private resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  /**
   * Prepares and secures HTTP options (Headers, Query Params, Auth Tokens).
   */
  private prepareOptions(options: RequestOptions, method: string): any {
    const httpOptions: any = {
      responseType: options.responseType || 'json'
    };

    // 1. Build Headers
    let headers = new HttpHeaders();
    if (options.headers) {
      if (options.headers instanceof HttpHeaders) {
        headers = options.headers;
      } else {
        Object.keys(options.headers).forEach(key => {
          const value = (options.headers as any)[key];
          headers = headers.set(key, Array.isArray(value) ? value.join(',') : value);
        });
      }
    }

    // 2. Inject JWT Bearer Token if not skipped
    if (!options.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Always signal secure request type to prevent CSRF in standard setups
    if (!headers.has('X-Requested-With')) {
      headers = headers.set('X-Requested-With', 'XMLHttpRequest');
    }

    httpOptions.headers = headers;

    // 3. Build & Sanitize Query Params
    if (options.params) {
      let paramsObj = options.params;
      if (paramsObj instanceof HttpParams) {
        const obj: { [key: string]: any } = {};
        const httpParamsInstance = paramsObj;
        httpParamsInstance.keys().forEach(key => {
          obj[key] = httpParamsInstance.getAll(key);
        });
        paramsObj = obj;
      }

      const rawParams = options.skipSanitization ? paramsObj : this.sanitize(paramsObj);
      let httpParams = new HttpParams();

      Object.keys(rawParams).forEach(key => {
        const val = rawParams[key];
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach(item => {
              httpParams = httpParams.append(key, String(item));
            });
          } else {
            httpParams = httpParams.set(key, String(val));
          }
        }
      });
      httpOptions.params = httpParams;
    }

    return httpOptions;
  }

  /**
   * Securely retrieves the authentication token from available web storage.
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch (e) {
      // Fallback for environment/platforms without window storage context (e.g. server rendering)
      return null;
    }
  }

  private saveTokenIfPresent(response: any): void {
    let token: string | null = null;
    let validityDuration: number | null = null;
    if (response) {
      if (response.token && typeof response.token === 'string') {
        token = response.token;
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const firstDataItem = response.data[0];
        if (firstDataItem && firstDataItem.token && typeof firstDataItem.token === 'string') {
          token = firstDataItem.token;
        }
        if (firstDataItem && typeof firstDataItem.expiresInMs === 'number') {
          validityDuration = firstDataItem.expiresInMs;
        }
      }
    }

    if (token) {
      try {
        localStorage.setItem('token', token);
        if (validityDuration !== null) {
          localStorage.setItem('validityDuration', String(validityDuration));
        }
      } catch (e) {
        // Fallback for SSR/non-browser contexts
      }
    }
  }

  /**
   * Sanitizes objects recursively to strip XSS vectors and clean inputs.
   */
  private sanitize(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    if (typeof data === 'object') {
      const sanitized: { [key: string]: any } = {};
      Object.keys(data).forEach(key => {
        sanitized[key] = this.sanitize(data[key]);
      });
      return sanitized;
    }

    return data;
  }

  /**
   * Sanitizes individual string inputs by:
   * 1. Stripping all HTML/XML tags.
   * 2. Removing potential XSS patterns (script tag contents, inline event triggers).
   * 3. Removing javascript: URLs.
   * 4. Trimming trailing/leading whitespace.
   */
  private sanitizeString(value: string): string {
    let cleaned = value.trim();

    // Remove script tag blocks and their contents completely
    cleaned = cleaned.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');

    // Remove inline event handlers (e.g., onclick=..., onerror=...)
    cleaned = cleaned.replace(/\bon\w+\s*=\s*(['"])(.*?)\1/gi, '');
    cleaned = cleaned.replace(/\bon\w+\s*=\s*([^\s>]+)/gi, '');

    // Remove javascript: and data: URI patterns
    cleaned = cleaned.replace(/(javascript|data|vbscript):/gi, '');

    // Remove any leftover HTML tags
    cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');

    return cleaned;
  }

  /**
   * Securely intercepts HTTP errors. Logs them safely and returns user-friendly messages.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let userMessage = 'An unexpected error occurred. Please try again later.';

    if (error.status === 0) {
      this.connectionService.setConnectionLost(true);
      userMessage = 'Unable to connect to the server. Please check your network connection.';
    }

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.error('Client-side error:', error.error.message);
    } else {

      // Extract specific message from backend if available
      if (error.error && typeof error.error.message === 'string') {
        userMessage = error.error.message;
      } else {
        // Map common status codes to generic, safe fallback messages
        if (error.status === 400) {
          userMessage = 'Invalid request. Please check your inputs and try again.';
        } else if (error.status === 401) {
          userMessage = 'Unauthorized. Please login again.';
        } else if (error.status === 403) {
          userMessage = 'Access denied. You do not have permission to access this resource.';
        } else if (error.status === 404) {
          userMessage = 'Requested resource not found.';
        } else if (error.status >= 500) {
          userMessage = 'A server error occurred. Our engineering team has been notified.';
        }
      }

      // Handle specific status-based side effects (e.g. redirect on 401)
      if (error.status === 401) {
        if (typeof window !== 'undefined') {
          this.authGuard.handleSessionExpiration();
        }
      }
    }

    // Return a secure, unified error structure to the application
    return throwError(() => ({
      status: error.status,
      message: userMessage,
      originalError: error
    }));
  }
}
