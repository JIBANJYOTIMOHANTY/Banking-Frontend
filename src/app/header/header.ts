import { Component, Output, EventEmitter, inject, HostListener, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';
import { HeaderService } from './service/header-service';
import { Subject, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  private commonService = inject(CommonService);
  private router = inject(Router);
  private headerService = inject(HeaderService);

  showProfileMenu = signal(false);
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  isLoading = signal(false);

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.searchResults.set([]);
          this.isLoading.set(false);
          return of({ status: 0, data: [] });
        }
        this.isLoading.set(true);
        return this.headerService.getAccounts(query).pipe(
          catchError(err => {
            console.error('Search failed:', err);
            this.isLoading.set(false);
            return of({ status: 0, data: [] });
          })
        );
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.status === 0) {
          this.searchResults.set(response.data || []);
        } else {
          this.searchResults.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Subscription error:', err);
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu.set(!this.showProfileMenu());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close dropdown if click is outside the profile container
    if (!target.closest('.profile-container')) {
      this.showProfileMenu.set(false);
    }
    // Close search results if click is outside the search container
    if (!target.closest('.search-container')) {
      this.searchResults.set([]);
    }
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.searchQuery.set(value);

    if (!value.trim()) {
      this.searchResults.set([]);
      this.isLoading.set(false);
    } else {
      this.isLoading.set(true);
    }

    this.searchSubject.next(value);
  }

  selectAccount(account: any) {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.router.navigate(['/customers/edit', account.accountNumber]);
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





