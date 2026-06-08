import { Component, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() toggleSidebar = new EventEmitter<void>();

  private commonService = inject(CommonService);
  private router = inject(Router);

  showProfileMenu = false;

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close dropdown if click is outside the profile container
    if (!target.closest('.profile-container')) {
      this.showProfileMenu = false;
    }
  }

  logout() {
    const logoutUrl = `${environment.BASE_API_URL}auth/logout`;
    this.commonService.post(logoutUrl, {}).subscribe({
      next: () => {
        this.clearSessionAndRedirect();
      },
      error: () => {
        // Fallback: always redirect and clear token even if backend request fails
        this.clearSessionAndRedirect();
      }
    });
  }

  private clearSessionAndRedirect() {
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    this.router.navigate(['/login']);
  }
}

