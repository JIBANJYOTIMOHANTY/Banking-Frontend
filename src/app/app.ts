import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Authguard } from './authguard';
import { SessionExpired } from './session-expired/session-expired';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionExpired],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('banking-frontend');
  private authGuard = inject(Authguard);
  protected readonly showSessionExpiredModal = this.authGuard.isSessionExpired;

  ngOnInit() {
    this.authGuard.canActivate();
  }

  @HostListener('document:click')
  @HostListener('document:keydown')
  onUserActivity() {
    this.authGuard.recordUserActivity();
  }

  onSessionExpiredConfirm() {
    this.authGuard.confirmSessionExpiration();
  }
}
