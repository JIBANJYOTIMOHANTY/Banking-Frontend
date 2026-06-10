import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private router = inject(Router);

  readonly items: SidebarItem[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { id: 'Customers', label: 'Customers', icon: 'people', route: '/customers' },
    { id: 'Accounts', label: 'Accounts', icon: 'account_balance_wallet', route: '/accounts' },
    { id: 'Transactions', label: 'Transactions', icon: 'receipt_long', route: '/transactions' }
  ];

  activeItem = signal<string>('Dashboard');
  sidebarOpen = signal<boolean>(true);
  isManuallyClosed = signal<boolean>(false);

  constructor() {
    this.syncActiveItem(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.syncActiveItem(event.urlAfterRedirects || event.url);
    });
  }

  private syncActiveItem(url: string) {
    const matched = this.items.find(item => url.startsWith(item.route));
    if (matched) {
      this.activeItem.set(matched.id);
    }
  }

  toggleSidebar() {
    const newState = !this.sidebarOpen();
    this.sidebarOpen.set(newState);
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      this.isManuallyClosed.set(!newState);
    }
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  openSidebar() {
    this.sidebarOpen.set(true);
  }
}
