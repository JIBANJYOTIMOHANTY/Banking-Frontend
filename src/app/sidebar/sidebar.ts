import { Component, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';
import { SidebarService, SidebarItem } from './service/sidebar-service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  sidebarService = inject(SidebarService);
  private commonService = inject(CommonService);
  private router = inject(Router);

  isInitialized = false;
  isResizing = false;
  private resizeTimeout: any;

  ngOnInit() {
    this.checkScreenSize();
    setTimeout(() => {
      this.isInitialized = true;
    }, 50);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.isResizing = true;
    this.checkScreenSize();

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.isResizing = false;
    }, 100);
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        this.sidebarService.closeSidebar();
      } else {
        if (!this.sidebarService.isManuallyClosed()) {
          this.sidebarService.openSidebar();
        }
      }
    }
  }

  navigate(item: SidebarItem) {
    this.router.navigate([item.route]);
    // Auto-close on mobile layout
    if (window.innerWidth < 768) {
      this.sidebarService.closeSidebar();
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
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    this.router.navigate(['/login']);
  }
}
