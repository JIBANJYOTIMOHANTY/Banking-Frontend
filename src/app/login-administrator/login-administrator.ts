import { Component, inject, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { filter } from 'rxjs';
import { LoginAdministratorService } from './service/login-administrator-service';

/**
 * Custom validator to check if field is empty or contains only whitespace characters.
 */
export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'whitespace': true };
}

/**
 * Custom validator for checking password complexity requirements matching backend UserValidator.
 */
export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  if (!value) return null;

  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasDigit = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(value);
  const isValidLength = value.length >= 8;

  const errors: any = {};
  if (!isValidLength) errors.minLength = true;
  if (!hasUppercase) errors.uppercase = true;
  if (!hasLowercase) errors.lowercase = true;
  if (!hasDigit) errors.digit = true;
  if (!hasSpecialChar) errors.specialChar = true;

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Custom validator to verify if password and confirmPassword fields match.
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
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

  isSignUp = signal(false);
  isPasswordFocused = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, noWhitespaceValidator]],
    password: ['', [Validators.required, noWhitespaceValidator]]
  });

  signUpForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, noWhitespaceValidator]],
    firstName: ['', [Validators.required, noWhitespaceValidator]],
    lastName: ['', [Validators.required, noWhitespaceValidator]],
    password: ['', [Validators.required, noWhitespaceValidator, passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]],
    role: ['ADMIN', [Validators.required]],
    profileImage: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.isSignUp.set(this.router.url.includes('signup'));
    if (this.hasToken()) {
      this.router.navigate(['/dashboard']);
    }

    // Subscribe to router events to handle direct URL changes (back/forward buttons)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isSignUp.set(this.router.url.includes('signup'));
      this.errorMessage.set(null);
      this.successMessage.set(null);
    });
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

  hasUppercase(val: string): boolean {
    return /[A-Z]/.test(val || '');
  }

  hasLowercase(val: string): boolean {
    return /[a-z]/.test(val || '');
  }

  hasDigit(val: string): boolean {
    return /[0-9]/.test(val || '');
  }

  hasSpecialChar(val: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(val || '');
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage.set('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.signUpForm.patchValue({
          profileImage: reader.result as string
        });
        this.signUpForm.get('profileImage')?.markAsTouched();
      };
      reader.onerror = () => {
        this.errorMessage.set('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  }

  toggleAuthMode(signUp: boolean) {
    this.isSignUp.set(signUp);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loginForm.reset();
    this.signUpForm.reset({ role: 'ADMIN' });
    if (signUp) {
      this.router.navigate(['/signup']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = this.loginForm.value;

    this.loginService.login(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Login failed. Please verify credentials.');
      }
    });
  }

  onSubmitSignUp() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = this.signUpForm.value;

    this.loginService.register(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Registration successful! You can now log in.');
        this.signUpForm.reset({ role: 'ADMIN' });
        // Auto-switch to login mode after 2 seconds
        setTimeout(() => {
          this.toggleAuthMode(false);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Registration failed. Please try again.');
      }
    });
  }

  isPasswordVisible = signal(false);

  togglePasswordVisibility() {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }
}

