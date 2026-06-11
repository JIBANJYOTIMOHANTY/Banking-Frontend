import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTable } from '../../custom-tables/custom-table';
import { CustomSkeletonLoading } from '../../custom-tables/custom-skeleton-loading/custom-skeleton-loading';

@Component({
  selector: 'app-security',
  imports: [CommonModule, CustomTable, CustomSkeletonLoading],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class Security {
  securitySuccessMessage = input<string | null>(null);
  securityErrorMessage = input<string | null>(null);
  currentPassword = input<string>('');
  newPassword = input<string>('');
  confirmPassword = input<string>('');
  sessionLogs = input<any[]>([]);
  sessionLogColumns = input<any[]>([]);
  sessionLogSearchQuery = input<string>('');
  isLoadingSessionLogs = input<boolean>(false);

  currentPasswordChange = output<string>();
  newPasswordChange = output<string>();
  confirmPasswordChange = output<string>();
  passwordChangeSubmit = output<void>();
  sessionLogSearch = output<string>();

  onCurrentPasswordInput(event: Event) {
    this.currentPasswordChange.emit((event.target as HTMLInputElement).value);
  }

  onNewPasswordInput(event: Event) {
    this.newPasswordChange.emit((event.target as HTMLInputElement).value);
  }

  onConfirmPasswordInput(event: Event) {
    this.confirmPasswordChange.emit((event.target as HTMLInputElement).value);
  }

  submitPasswordChange() {
    this.passwordChangeSubmit.emit();
  }

  onSessionLogSearch(event: Event) {
    this.sessionLogSearch.emit((event.target as HTMLInputElement).value);
  }
}
