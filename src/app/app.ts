import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Authguard } from './authguard';
import { SessionExpired } from './session-expired/session-expired';
import { ConnectionLost } from './connection-lost/connection-lost';
import { ConnectionService } from './common-service/connection-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionExpired, ConnectionLost],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('banking-frontend');
  private authGuard = inject(Authguard);
  private connectionService = inject(ConnectionService);

  protected readonly showSessionExpiredModal = this.authGuard.isSessionExpired;
  protected readonly showConnectionLostModal = this.connectionService.isConnectionLost;

  ngOnInit() {
    this.authGuard.canActivate();
  }

  @HostListener('document:click')
  @HostListener('document:keydown')
  @HostListener('document:mousedown')
  @HostListener('document:touchstart')
  onUserActivity() {
    this.authGuard.recordUserActivity();
  }

  onSessionExpiredConfirm() {
    this.authGuard.confirmSessionExpiration();
  }
}
