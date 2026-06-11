import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  selectedTheme = input<string>('slate');
  enableAutoRefresh = input<boolean>(true);
  enableDesktopAlerts = input<boolean>(true);
  settingsSuccessMessage = input<string | null>(null);

  themeChange = output<string>();
  autoRefreshToggle = output<void>();
  desktopAlertsToggle = output<void>();
  save = output<void>();

  selectTheme(theme: string) {
    this.themeChange.emit(theme);
  }

  toggleAutoRefresh() {
    this.autoRefreshToggle.emit();
  }

  toggleDesktopAlerts() {
    this.desktopAlertsToggle.emit();
  }

  saveSettings() {
    this.save.emit();
  }
}
