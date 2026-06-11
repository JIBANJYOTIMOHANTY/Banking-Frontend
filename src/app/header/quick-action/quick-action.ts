import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-action',
  imports: [CommonModule],
  templateUrl: './quick-action.html',
  styleUrl: './quick-action.css',
})
export class QuickAction {
  showQuickActions = input<boolean>(false);

  quickActionsToggle = output<void>();
  freezeModalOpen = output<void>();
  broadcastModalOpen = output<void>();

  toggleQuickActions() {
    this.quickActionsToggle.emit();
  }

  openFreezeModal() {
    this.freezeModalOpen.emit();
  }

  openBroadcastModal() {
    this.broadcastModalOpen.emit();
  }
}
