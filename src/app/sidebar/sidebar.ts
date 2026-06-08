import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private commonService = inject(CommonService);
  private router = inject(Router);

  activeItem = 'Dashboard';

  setActive(item: string) {
    this.activeItem = item;
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

