import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pop-up-modal',
  imports: [CommonModule],
  templateUrl: './pop-up-modal.html',
  styleUrl: './pop-up-modal.css',
})
export class PopUpModal {
  isOpen = input<boolean>(false);
  title = input<string>('');
  icon = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl' | '4xl'>('md');

  closeModalEvent = output<void>();

  sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      default: return 'max-w-md';
    }
  });

  closeModal() {
    this.closeModalEvent.emit();
  }

  onBackdropClick(event: MouseEvent) {
    // Only close if the click was directly on the background backdrop overlay container
    const target = event.target as HTMLElement;
    if (target.classList.contains('backdrop-overlay')) {
      this.closeModal();
    }
  }
}
