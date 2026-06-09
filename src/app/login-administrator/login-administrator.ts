import { Component, inject, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LoginAdministratorService } from './service/login-administrator-service';

/**
 * Custom validator to check if field is empty or contains only whitespace characters.
 */
export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'whitespace': true };
}

@Component({
  selector: 'app-login-administrator',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-administrator.html',
  styleUrl: './login-administrator.css',
})
export class LoginAdministrator implements OnInit {
  private fb = inject(FormBuilder);
  private loginService = inject(LoginAdministratorService);
  private router = inject(Router);

  ngOnInit() {
    if (this.hasToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent) {
    if (event.key === 'token' && event.newValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  private hasToken(): boolean {
    try {
      return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
    } catch (e) {
      return false;
    }
  }

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, noWhitespaceValidator]],
    password: ['', [Validators.required, noWhitespaceValidator]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = this.loginForm.value;

    this.loginService.login(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // The token is automatically saved inside CommonService
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Login failed. Please verify credentials.');
      }
    });
  }
}
