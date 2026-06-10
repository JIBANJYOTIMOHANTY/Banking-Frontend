import { inject, Injectable, signal, PLATFORM_ID, REQUEST } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Authguard {
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });
  
  public isSessionExpired = signal(false);
  private lastRefreshTime = 0;
  private isRefreshing = false;

  canActivate(): boolean {
    const isServer = isPlatformServer(this.platformId);

    if (isServer) {
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
      if (!isServer) {
        if (this.isRefreshing) {
          return true; // Allow routing if we are already refreshing the token in the background
        }
        this.handleSessionExpiration();
      }
      return false;
    }

    return true;
  }

  public handleSessionExpiration() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('validityDuration');
      sessionStorage.removeItem('token');
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {
      // Handle environment/platforms without window storage context
    }

    // Show the custom session-expired component popup modal
    const isLoginPage = this.router.url && this.router.url.includes('/login');
    if (!isLoginPage) {
      this.isSessionExpired.set(true);
    }
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
    if (!token) {
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
              // Save to cookie as well for SSR support
              let cookieStr = `token=${newToken}; path=/; SameSite=Strict`;
              if (newValidity !== null && newValidity !== undefined) {
                cookieStr += `; max-age=${Math.floor(newValidity / 1000)}`;
              }
              document.cookie = cookieStr;
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
    if (isPlatformServer(this.platformId)) {
      if (this.request) {
        let cookieHeader = '';
        if (typeof this.request.headers.get === 'function') {
          cookieHeader = this.request.headers.get('cookie') || '';
        } else {
          cookieHeader = (this.request.headers as any)['cookie'] || '';
        }
        return this.getCookieValue(cookieHeader, 'token');
      }
      return null;
    } else {
      try {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
      } catch (e) {
        return null;
      }
    }
  }

  private getCookieValue(cookieHeader: string, name: string): string | null {
    if (!cookieHeader) return null;
    const nameEQ = name + "=";
    const ca = cookieHeader.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const decodedPayload = JSON.parse(atob(parts[1]));
      if (decodedPayload && decodedPayload.exp) {
        const expirationDate = decodedPayload.exp * 1000;
        // Allow a 5-second grace period for clock skew, network latency, and active refresh processes
        return (expirationDate + 5000) < Date.now();
      }
    } catch (e) {
      return true;
    }
    return false;
  }
}
