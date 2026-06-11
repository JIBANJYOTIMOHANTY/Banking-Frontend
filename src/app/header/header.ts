import { Component, Output, EventEmitter, inject, HostListener, OnInit, OnDestroy, signal } from '@angular/core';
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
export class Header implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  private commonService = inject(CommonService);
  private router = inject(Router);
  private headerService = inject(HeaderService);

  showProfileMenu = signal(false);
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  isLoading = signal(false);

  showQuickActions = signal(false);
  showFreezeModal = signal(false);
  showBroadcastModal = signal(false);
  activeBroadcastAlert = signal<any>(null);
  freezeFormAccountNo = signal('');
  freezeFormAction = signal('freeze');
  broadcastFormMessage = signal('');
  broadcastFormType = signal('INFO');
  quickActionsMessage = signal<string | null>(null);
  quickActionsError = signal<string | null>(null);
  isBannerDismissed = this.headerService.isBannerDismissed;


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

  ngOnInit() {
    this.fetchActiveBroadcast();
  }

  fetchActiveBroadcast() {
    this.headerService.getActiveBroadcast().subscribe({
      next: (response: any) => {
        if (response && response.status === 0 && response.data && response.data.length > 0) {
          const newAlert = response.data[0];
          const currentAlert = this.activeBroadcastAlert();
          if (!currentAlert || currentAlert.id !== newAlert.id) {
            this.isBannerDismissed.set(false);
          }
          this.activeBroadcastAlert.set(newAlert);
        } else {
          this.activeBroadcastAlert.set(null);
        }
      },
      error: (err) => console.error('Failed to fetch active broadcast:', err)
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
    // Close quick actions dropdown if click is outside its container
    if (!target.closest('.quick-actions-container')) {
      this.showQuickActions.set(false);
    }
  }

  toggleQuickActions() {
    this.showQuickActions.set(!this.showQuickActions());
  }

  openFreezeModal() {
    this.showQuickActions.set(false);
    this.showFreezeModal.set(true);
    this.freezeFormAccountNo.set('');
    this.freezeFormAction.set('freeze');
    this.quickActionsMessage.set(null);
    this.quickActionsError.set(null);
  }

  closeFreezeModal() {
    this.showFreezeModal.set(false);
  }

  openBroadcastModal() {
    this.showQuickActions.set(false);
    this.showBroadcastModal.set(true);
    this.broadcastFormMessage.set('');
    this.broadcastFormType.set('INFO');
    this.quickActionsMessage.set(null);
    this.quickActionsError.set(null);
  }

  closeBroadcastModal() {
    this.showBroadcastModal.set(false);
  }

  setBroadcastType(type: string) {
    this.broadcastFormType.set(type);
  }

  onFreezeAccountInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.freezeFormAccountNo.set(input.value);
  }

  setFreezeAction(action: string) {
    this.freezeFormAction.set(action);
  }

  submitFreeze() {
    const accNo = this.freezeFormAccountNo().trim();
    const action = this.freezeFormAction();
    this.quickActionsMessage.set(null);
    this.quickActionsError.set(null);

    if (!accNo.match(/^ACC[0-9]+$/)) {
      this.quickActionsError.set('Invalid Account Number format (e.g. ACC0001)');
      return;
    }

    if (action === 'freeze') {
      this.headerService.freezeAccount(accNo).subscribe({
        next: (res) => {
          if (res && res.status === 0) {
            this.quickActionsMessage.set(`Account ${accNo} has been successfully frozen.`);
          } else {
            this.quickActionsError.set(res.message || 'Operation failed.');
          }
        },
        error: (err) => {
          this.quickActionsError.set(err.message || 'Server error occurred.');
        }
      });
    } else {
      this.headerService.unfreezeAccount(accNo).subscribe({
        next: (res) => {
          if (res && res.status === 0) {
            this.quickActionsMessage.set(`Account ${accNo} has been successfully unfrozen.`);
          } else {
            this.quickActionsError.set(res.message || 'Operation failed.');
          }
        },
        error: (err) => {
          this.quickActionsError.set(err.message || 'Server error occurred.');
        }
      });
    }
  }

  onBroadcastMessageInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.broadcastFormMessage.set(input.value);
  }

  submitBroadcast() {
    const msg = this.broadcastFormMessage().trim();
    const type = this.broadcastFormType();
    this.quickActionsMessage.set(null);
    this.quickActionsError.set(null);

    if (!msg) {
      this.quickActionsError.set('Alert message content cannot be empty.');
      return;
    }

    this.headerService.publishBroadcast(msg, type).subscribe({
      next: (res) => {
        if (res && res.status === 0) {
          this.quickActionsMessage.set('System alert broadcasted successfully.');
          this.activeBroadcastAlert.set(res.data[0]);
          this.isBannerDismissed.set(false);
          this.broadcastFormMessage.set('');
        } else {
          this.quickActionsError.set(res.message || 'Failed to publish alert.');
        }
      },
      error: (err) => {
        this.quickActionsError.set(err.message || 'Server error occurred.');
      }
    });
  }


  clearBroadcast() {
    this.quickActionsMessage.set(null);
    this.quickActionsError.set(null);

    this.headerService.clearActiveBroadcast().subscribe({
      next: (res) => {
        if (res && res.status === 0) {
          this.quickActionsMessage.set('Active system alert cleared successfully.');
          this.activeBroadcastAlert.set(null);
        } else {
          this.quickActionsError.set(res.message || 'Failed to clear alert.');
        }
      },
      error: (err) => {
        this.quickActionsError.set(err.message || 'Server error occurred.');
      }
    });
  }

  dismissAlertBanner() {
    this.isBannerDismissed.set(true);
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





