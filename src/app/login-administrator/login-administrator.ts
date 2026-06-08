import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LoginAdministratorService } from './login-administrator-service';

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
export class LoginAdministrator {
  private fb = inject(FormBuilder);
  private loginService = inject(LoginAdministratorService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, noWhitespaceValidator]],
    password: ['', [Validators.required, noWhitespaceValidator]]
  });

  isLoading = false;
  errorMessage: string | null = null;

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload = this.loginForm.value;

    this.loginService.login(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        // The token is automatically saved inside CommonService
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Login failed. Please verify credentials.';
      }
    });
  }
}
