import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Authguard {
  private router = inject(Router);
  private http = inject(HttpClient);
  
  public isSessionExpired = signal(false);
  private lastRefreshTime = 0;
  private isRefreshing = false;

  canActivate(): boolean {
    // Skip guard checks on the server side (SSR) to prevent temporary flashing of the login page
    if (typeof window === 'undefined') {
      return true;
    }

    // If we are currently showing the session expired modal, block routing but do NOT redirect yet
    if (this.isSessionExpired()) {
      return false;
    }

    // If the current route is login, don't run checks to avoid redundant redirects
    if (this.router.url.startsWith('/login')) {
      return true;
    }

    const token = this.getAuthToken();
    
    // If no token exists, redirect silently
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // If token exists but is expired, clear and trigger custom popup
    if (this.isTokenExpired(token)) {
      this.handleSessionExpiration();
      return false;
    }

    return true;
  }

  public handleSessionExpiration() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('validityDuration');
      sessionStorage.removeItem('token');
    } catch (e) {
      // Handle environment/platforms without window storage context
    }

    // Show the custom session-expired component popup modal
    this.isSessionExpired.set(true);
  }

  public confirmSessionExpiration() {
    this.isSessionExpired.set(false);
    this.router.navigate(['/login']);
  }

  public recordUserActivity() {
    if (typeof window === 'undefined' || this.isSessionExpired()) {
      return;
    }

    const token = this.getAuthToken();
    if (!token || this.isTokenExpired(token)) {
      return;
    }

    let validity = 600000; // default 10 minutes (in ms)
    try {
      const validityStr = localStorage.getItem('validityDuration');
      if (validityStr) {
        validity = Number(validityStr);
      }
    } catch (e) {}

    // Throttle refresh requests to validity / 4 (minimum 2s)
    const throttleInterval = Math.max(2000, validity / 4);

    if (Date.now() - this.lastRefreshTime > throttleInterval && !this.isRefreshing) {
      this.isRefreshing = true;
      const url = `${environment.BASE_API_URL}auth/refresh`;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.post<any>(url, {}, { headers }).subscribe({
        next: (response) => {
          this.isRefreshing = false;
          this.lastRefreshTime = Date.now();
          if (response && response.status === 0 && response.data && response.data[0]) {
            const newToken = response.data[0].token;
            const newValidity = response.data[0].expiresInMs;
            try {
              localStorage.setItem('token', newToken);
              localStorage.setItem('validityDuration', String(newValidity));
            } catch (e) {}
          }
        },
        error: (err) => {
          this.isRefreshing = false;
          // If the token is already expired on the server, handle session expiration
          if (err.status === 401) {
            this.handleSessionExpiration();
          }
        }
      });
    }
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch (e) {
      return null;
    }
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const decodedPayload = JSON.parse(atob(parts[1]));
      if (decodedPayload && decodedPayload.exp) {
        const expirationDate = decodedPayload.exp * 1000;
        return expirationDate < Date.now();
      }
    } catch (e) {
      return true;
    }
    return false;
  }
}
