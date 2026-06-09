import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-session-expired',
  imports: [],
  templateUrl: './session-expired.html',
  styleUrl: './session-expired.css',
})
export class SessionExpired {
  @Output() confirm = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }
}
