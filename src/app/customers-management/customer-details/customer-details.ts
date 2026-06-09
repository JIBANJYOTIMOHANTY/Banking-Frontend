import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../common-service/common-service';
import { environment } from '../../environments/environment';
import { Sidebar } from '../../sidebar/sidebar';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { SidebarService } from '../../sidebar/service/sidebar-service';

@Component({
  selector: 'app-customer-details',
  imports: [CommonModule, ReactiveFormsModule, Sidebar, Header, Footer],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css',
})
export class CustomerDetails implements OnInit {
  sidebarService = inject(SidebarService);
  private commonService = inject(CommonService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Registration Form with mandatory validations
  addForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
    dob: ['', [Validators.required]],
    email: ['', [Validators.email]],
    mobileNumber: ['', [Validators.required]],
    govtId: ['', [Validators.required]],
    govtIdType: ['aadhar', [Validators.required]],
    occupation: [''],
    nomineeName: [''],
    nomineeRelation: [''],
    address: ['', [Validators.required]]
  });

  ngOnInit() {
    // Component initialization
  }

  submitCustomer() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const payload = {
      firstName: this.addForm.value.firstName,
      lastName: this.addForm.value.lastName,
      balance: this.addForm.value.initialBalance,
      dob: this.addForm.value.dob,
      email: this.addForm.value.email,
      mobileNumber: this.addForm.value.mobileNumber,
      govtId: this.addForm.value.govtId,
      govtIdType: this.addForm.value.govtIdType,
      occupation: this.addForm.value.occupation,
      nomineeName: this.addForm.value.nomineeName,
      nomineeRelation: this.addForm.value.nomineeRelation,
      address: this.addForm.value.address
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const url = `${environment.BASE_API_URL}bank`;

    this.commonService.post<any>(url, payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.successMessage.set('Customer registered successfully! Redirecting...');
          setTimeout(() => {
            this.router.navigate(['/customers']);
          }, 1500);
        } else {
          this.errorMessage.set(response.message || 'Failed to create customer.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred during customer creation.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/customers']);
  }
}
