import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile {
  userFirstName = input<string>('');
  userLastName = input<string>('');
  userRole = input<string>('');
  editFirstName = input<string>('');
  editLastName = input<string>('');
  editEmail = input<string>('');
  profileSuccessMessage = input<string | null>(null);
  profileImage = input<string | null>(null);

  editFirstNameChange = output<string>();
  editLastNameChange = output<string>();
  editEmailChange = output<string>();
  save = output<void>();

  onEditFirstNameInput(event: Event) {
    this.editFirstNameChange.emit((event.target as HTMLInputElement).value);
  }

  onEditLastNameInput(event: Event) {
    this.editLastNameChange.emit((event.target as HTMLInputElement).value);
  }

  onEditEmailInput(event: Event) {
    this.editEmailChange.emit((event.target as HTMLInputElement).value);
  }

  saveProfileChanges() {
    this.save.emit();
  }
}
