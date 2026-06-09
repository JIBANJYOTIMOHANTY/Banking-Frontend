import { Component, inject, signal } from '@angular/core';
import { ConnectionService } from '../common-service/connection-service';

@Component({
  selector: 'app-connection-lost',
  imports: [],
  templateUrl: './connection-lost.html',
  styleUrl: './connection-lost.css',
})
export class ConnectionLost {
  private connectionService = inject(ConnectionService);
  protected readonly isChecking = signal<boolean>(false);
  protected readonly checkFailed = signal<boolean>(false);

  async onRetry() {
    this.isChecking.set(true);
    this.checkFailed.set(false);
    
    // Simulate a brief delay for high premium UX feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isReachable = await this.connectionService.checkBackendConnection();
    this.isChecking.set(false);
    if (!isReachable) {
      this.checkFailed.set(true);
    }
  }
}
