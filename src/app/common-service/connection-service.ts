import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private http = inject(HttpClient);
  
  // Track connection status using a signal
  readonly isConnectionLost = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('offline', () => {
        this.isConnectionLost.set(true);
      });
      window.addEventListener('online', () => {
        this.checkBackendConnection();
      });
    }
  }

  setConnectionLost(value: boolean) {
    this.isConnectionLost.set(value);
  }

  async checkBackendConnection(): Promise<boolean> {
    try {
      // Make a lightweight check using the configured BASE_API_URL.
      // We perform a simple check. If the backend is down, this will throw an error with status 0.
      await firstValueFrom(this.http.get(environment.BASE_API_URL, { responseType: 'text' }));
      this.isConnectionLost.set(false);
      return true;
    } catch (error: any) {
      // If the error has a status and it is NOT 0, it means the server responded (e.g. 404 Not Found),
      // which means the server is reachable and active.
      if (error && error.status !== 0) {
        this.isConnectionLost.set(false);
        return true;
      }
      this.isConnectionLost.set(true);
      return false;
    }
  }
}
