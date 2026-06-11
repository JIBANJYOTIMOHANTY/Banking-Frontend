import { Component, Output, EventEmitter, inject, HostListener, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';
import { HeaderService } from './service/header-service';
import { Subject, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

import { CustomTable } from '../custom-tables/custom-table';
import { TableColumn } from '../custom-tables/custom-table-models/custom-table-model';
import { CustomSkeletonLoading } from '../custom-tables/custom-skeleton-loading/custom-skeleton-loading';
import { MyProfile } from './my-profile/my-profile';
import { Settings } from './settings/settings';
import { Security } from './security/security';
import { QuickAction } from './quick-action/quick-action';
import { PopUpModal } from '../custom-pop-up-modal/pop-up-modal/pop-up-modal';

@Component({
  selector: 'app-header',
  imports: [MyProfile, Settings, Security, QuickAction, PopUpModal],
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
  userFirstName = signal('Sarah');
  userLastName = signal('Jenkins');
  userRole = signal('Admin Manager');

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

  // User Center (Profile, Settings, Security)
  showUserCenterModal = signal(false);
  activeUserCenterTab = signal<'profile' | 'settings' | 'security'>('profile');

  // Profile edits
  editFirstName = signal('');
  editLastName = signal('');
  editEmail = signal('sarah.jenkins@trustbank.com');
  profileSuccessMessage = signal<string | null>(null);

  // Settings
  selectedTheme = signal('slate');
  enableAutoRefresh = signal(true);
  enableDesktopAlerts = signal(true);
  settingsSuccessMessage = signal<string | null>(null);

  // Security
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  securityErrorMessage = signal<string | null>(null);
  securitySuccessMessage = signal<string | null>(null);
  sessionLogs = signal<any[]>([]);
  sessionLogSearchQuery = signal('');
  isLoadingSessionLogs = signal(false);

  sessionLogColumns: TableColumn[] = [
    { key: 'deviceName', header: 'Device / Browser', type: 'icon-text', iconKey: 'deviceIcon' },
    { key: 'ipAddress', header: 'IP Address', type: 'mono' },
    { key: 'activity', header: 'Activity', type: 'status-text', statusKey: 'status' },
    { key: 'timestamp', header: 'Session Time', type: 'text' },
    { key: 'status', header: 'Status', type: 'badge', align: 'right' }
  ];


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
    if (typeof window !== 'undefined') {
      this.fetchActiveBroadcast();

      // Load and apply visual theme
      try {
        const storedTheme = localStorage.getItem('theme') || 'slate';
        this.applyTheme(storedTheme);
      } catch (e) {
        console.error('Failed to load theme', e);
      }

      try {
        const storedFirstName = localStorage.getItem('firstName');
        const storedLastName = localStorage.getItem('lastName');
        const storedRole = localStorage.getItem('role');
        if (storedFirstName) this.userFirstName.set(storedFirstName);
        if (storedLastName) this.userLastName.set(storedLastName);
        if (storedRole) this.userRole.set(storedRole);
      } catch (e) {
        console.error('Failed to load user name/role from storage', e);
      }
    }
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
            this.addSessionLogEntry(`Froze account ${accNo}`);
            setTimeout(() => {
              this.closeFreezeModal();
              this.quickActionsMessage.set(null);
            }, 1500);
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
            this.addSessionLogEntry(`Unfroze account ${accNo}`);
            setTimeout(() => {
              this.closeFreezeModal();
              this.quickActionsMessage.set(null);
            }, 1500);
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
          this.addSessionLogEntry(`Published ${type} broadcast alert`);
          this.closeBroadcastModal();
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
          this.addSessionLogEntry('Cleared active broadcast alert');
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

  onSessionLogSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.sessionLogSearchQuery.set(input.value);
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
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('role');
      sessionStorage.removeItem('token');
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    this.router.navigate(['/login']);
  }

  // User Center Management Methods
  openUserCenter(tab: 'profile' | 'settings' | 'security') {
    this.showProfileMenu.set(false);
    this.activeUserCenterTab.set(tab);

    // Initialize fields
    this.editFirstName.set(this.userFirstName());
    this.editLastName.set(this.userLastName());
    this.profileSuccessMessage.set(null);
    this.settingsSuccessMessage.set(null);
    this.securitySuccessMessage.set(null);
    this.securityErrorMessage.set(null);
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.sessionLogSearchQuery.set('');

    // Initialize session logs and theme selection
    this.initSessionLogs();
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem('theme') || 'slate';
        this.selectedTheme.set(storedTheme);
      } catch (e) { }
    }

    this.showUserCenterModal.set(true);
  }

  closeUserCenterModal() {
    this.showUserCenterModal.set(false);
  }

  setUserCenterTab(tab: 'profile' | 'settings' | 'security') {
    this.activeUserCenterTab.set(tab);
  }

  // Profile Action Handlers
  onEditFirstNameInput(event: Event) {
    this.editFirstName.set((event.target as HTMLInputElement).value);
  }

  onEditLastNameInput(event: Event) {
    this.editLastName.set((event.target as HTMLInputElement).value);
  }

  onEditEmailInput(event: Event) {
    this.editEmail.set((event.target as HTMLInputElement).value);
  }

  saveProfileChanges() {
    const fName = this.editFirstName().trim();
    const lName = this.editLastName().trim();
    if (!fName || !lName) {
      return;
    }

    this.userFirstName.set(fName);
    this.userLastName.set(lName);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('firstName', fName);
        localStorage.setItem('lastName', lName);
      } catch (e) {
        console.error('Failed to save to local storage', e);
      }
    }

    this.profileSuccessMessage.set('Profile details updated successfully!');
    this.addSessionLogEntry('Profile details updated');
    setTimeout(() => this.profileSuccessMessage.set(null), 3000);
  }

  // Theme Applying Logic
  applyTheme(theme: string) {
    if (typeof window !== 'undefined') {
      try {
        const root = document.documentElement;
        root.classList.remove('theme-slate', 'theme-indigo', 'theme-emerald', 'theme-light');
        root.classList.add(`theme-${theme}`);
        localStorage.setItem('theme', theme);
        this.selectedTheme.set(theme);
      } catch (e) {
        console.error('Failed to apply theme', e);
      }
    }
  }

  // Settings Action Handlers
  selectTheme(theme: string) {
    this.applyTheme(theme);
  }

  toggleAutoRefresh() {
    this.enableAutoRefresh.set(!this.enableAutoRefresh());
  }

  toggleDesktopAlerts() {
    this.enableDesktopAlerts.set(!this.enableDesktopAlerts());
  }

  saveSettings() {
    this.settingsSuccessMessage.set('System preferences saved successfully!');
    this.addSessionLogEntry('Preferences saved');
    setTimeout(() => this.settingsSuccessMessage.set(null), 3000);
  }

  // Security Action Handlers
  onCurrentPasswordInput(event: Event) {
    this.currentPassword.set((event.target as HTMLInputElement).value);
  }

  onNewPasswordInput(event: Event) {
    this.newPassword.set((event.target as HTMLInputElement).value);
  }

  onConfirmPasswordInput(event: Event) {
    this.confirmPassword.set((event.target as HTMLInputElement).value);
  }

  submitPasswordChange() {
    this.securityErrorMessage.set(null);
    this.securitySuccessMessage.set(null);

    const curr = this.currentPassword();
    const newPass = this.newPassword();
    const conf = this.confirmPassword();

    if (!curr || !newPass || !conf) {
      this.securityErrorMessage.set('All fields are required.');
      return;
    }

    if (newPass.length < 6) {
      this.securityErrorMessage.set('New password must be at least 6 characters.');
      return;
    }

    if (newPass !== conf) {
      this.securityErrorMessage.set('New password and confirmation do not match.');
      return;
    }

    this.securitySuccessMessage.set('Password successfully updated!');
    this.addSessionLogEntry('Credentials updated');
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    setTimeout(() => this.securitySuccessMessage.set(null), 3000);
  }

  // Device Session Logs Detection Logic
  detectCurrentDevice(): { deviceName: string; deviceIcon: string } {
    let deviceName = 'Chrome (Windows 11)';
    let deviceIcon = 'laptop_windows';

    if (typeof window === 'undefined' || !navigator) {
      return { deviceName, deviceIcon };
    }

    try {
      const ua = navigator.userAgent;
      let browser = 'Chrome';
      let os = 'Windows 11';

      // Detect OS
      if (ua.indexOf('Win') !== -1) {
        if (ua.indexOf('Windows NT 10.0') !== -1) os = 'Windows 11';
        else os = 'Windows';
        deviceIcon = 'laptop_windows';
      } else if (ua.indexOf('Mac') !== -1) {
        if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
          os = 'iOS';
          deviceIcon = 'smartphone';
        } else {
          os = 'macOS';
          deviceIcon = 'desktop_mac';
        }
      } else if (ua.indexOf('X11') !== -1 || ua.indexOf('Linux') !== -1) {
        os = 'Linux';
        deviceIcon = 'settings_ethernet';
      } else if (ua.indexOf('Android') !== -1) {
        os = 'Android';
        deviceIcon = 'phone_android';
      }

      // Detect Browser
      if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Chromium') === -1 && ua.indexOf('Edg') === -1) {
        browser = 'Chrome';
      } else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Chromium') === -1) {
        browser = 'Safari';
      } else if (ua.indexOf('Firefox') !== -1) {
        browser = 'Firefox';
      } else if (ua.indexOf('Edg') !== -1) {
        browser = 'Microsoft Edge';
      } else if (ua.indexOf('Chromium') !== -1) {
        browser = 'Chromium';
      }

      deviceName = `${browser} (${os})`;
    } catch (e) {
      console.error('Failed to parse user agent', e);
    }

    return { deviceName, deviceIcon };
  }

  initSessionLogs() {
    this.isLoadingSessionLogs.set(true);
    this.headerService.getSessionLogs().subscribe({
      next: (res: any) => {
        this.isLoadingSessionLogs.set(false);
        if (res && res.status === 0 && res.data) {
          this.sessionLogs.set(res.data);
        } else {
          this.sessionLogs.set([]);
        }
      },
      error: (err) => {
        this.isLoadingSessionLogs.set(false);
        console.error('Failed to load session logs from database:', err);
        this.fallbackSessionLogs();
      }
    });
  }

  fallbackSessionLogs() {
    const current = this.detectCurrentDevice();
    this.sessionLogs.set([
      {
        deviceIcon: current.deviceIcon,
        deviceName: current.deviceName,
        ipAddress: '192.168.1.108',
        activity: 'Admin Portal Access (Offline)',
        timestamp: 'Just now',
        status: 'Active'
      }
    ]);
  }

  addSessionLogEntry(activity: string) {
    const current = this.detectCurrentDevice();
    const currentLogs = this.sessionLogs();
    const activeIp = currentLogs.length > 0 ? currentLogs[0].ipAddress : '192.168.1.108';

    const payload = {
      deviceName: current.deviceName,
      deviceIcon: current.deviceIcon,
      ipAddress: activeIp,
      activity: activity,
      status: 'Active'
    };

    this.headerService.addSessionLog(payload).subscribe({
      next: (res: any) => {
        if (res && res.status === 0 && res.data && res.data.length > 0) {
          const createdLog = res.data[0];
          this.sessionLogs.set([createdLog, ...this.sessionLogs()]);
        } else {
          this.localPrependLog(payload);
        }
      },
      error: (err) => {
        console.error('Failed to log session activity to database:', err);
        this.localPrependLog(payload);
      }
    });
  }

  localPrependLog(payload: any) {
    const localLog = {
      ...payload,
      timestamp: 'Just now'
    };
    this.sessionLogs.set([localLog, ...this.sessionLogs()]);
  }
}





