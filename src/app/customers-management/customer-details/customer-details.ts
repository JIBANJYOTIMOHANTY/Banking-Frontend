import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common-service/common-service';
import { environment } from '../../environments/environment';
import { Sidebar } from '../../sidebar/sidebar';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { SidebarService } from '../../sidebar/service/sidebar-service';
import { CustomerService } from '../service/customer-service';

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
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isEditMode = signal(false);
  accountNumber = signal<string | null>(null);

  // Registration Form with mandatory validations
  addForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
    dob: ['', [Validators.required]],
    email: ['', [Validators.email]],
    countryCode: ['+91', [Validators.required]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    govtId: ['', [Validators.required]],
    govtIdType: ['aadhar', [Validators.required]],
    pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
    occupation: [''],
    nomineeName: [''],
    nomineeRelation: [''],
    address: ['', [Validators.required]],
    landmark: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    country: ['', [Validators.required]],
    pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const accNum = params.get('accountNumber');
      if (accNum) {
        this.isEditMode.set(true);
        this.accountNumber.set(accNum);
        this.addForm.get('initialBalance')?.clearValidators();
        this.addForm.get('initialBalance')?.updateValueAndValidity();
        this.loadCustomerDetails(accNum);
      } else {
        this.isEditMode.set(false);
        this.accountNumber.set(null);
        this.addForm.get('initialBalance')?.setValidators([Validators.required, Validators.min(0)]);
        this.addForm.get('initialBalance')?.updateValueAndValidity();
        this.addForm.reset({
          countryCode: '+91',
          govtIdType: 'aadhar',
          initialBalance: 0
        });
      }
    });
  }

  loadCustomerDetails(accountNumber: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.customerService.getCustomer(accountNumber).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response && response.status === 0 && response.data && response.data.length > 0) {
          const customer = response.data[0];

          let countryCode = '+91';
          let mobileNum = '';
          if (customer.mobileNumber) {
            if (customer.mobileNumber.startsWith('+')) {
              if (customer.mobileNumber.length > 10) {
                countryCode = customer.mobileNumber.slice(0, customer.mobileNumber.length - 10);
                mobileNum = customer.mobileNumber.slice(customer.mobileNumber.length - 10);
              } else {
                mobileNum = customer.mobileNumber;
              }
            } else {
              mobileNum = customer.mobileNumber;
            }
          }

          this.addForm.patchValue({
            firstName: customer.firstName,
            lastName: customer.lastName,
            initialBalance: customer.balance || 0,
            dob: customer.dob || '',
            email: customer.email || '',
            countryCode: countryCode,
            mobileNumber: mobileNum,
            govtId: customer.govtId || '',
            govtIdType: customer.govtIdType || 'aadhar',
            pan: customer.pan || '',
            occupation: customer.occupation || '',
            nomineeName: customer.nomineeName || '',
            nomineeRelation: customer.nomineeRelation || '',
            address: customer.address || '',
            landmark: customer.landmark || '',
            city: customer.city || '',
            state: customer.state || '',
            country: customer.country || '',
            pincode: customer.pincode || ''
          });
        } else {
          this.errorMessage.set(response.message || 'Failed to fetch customer details.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred while fetching customer details.');
      }
    });
  }

  submitCustomer() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const payload: any = {
      firstName: this.addForm.value.firstName,
      lastName: this.addForm.value.lastName,
      dob: this.addForm.value.dob,
      email: this.addForm.value.email,
      mobileNumber: `${this.addForm.value.countryCode}${this.addForm.value.mobileNumber}`,
      govtId: this.addForm.value.govtId,
      govtIdType: this.addForm.value.govtIdType,
      pan: this.addForm.value.pan,
      occupation: this.addForm.value.occupation,
      nomineeName: this.addForm.value.nomineeName,
      nomineeRelation: this.addForm.value.nomineeRelation,
      address: this.addForm.value.address,
      landmark: this.addForm.value.landmark,
      city: this.addForm.value.city,
      state: this.addForm.value.state,
      country: this.addForm.value.country,
      pincode: this.addForm.value.pincode
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.isEditMode()) {
      payload.accountNumber = this.accountNumber();
      this.customerService.updateCustomer(payload).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response && response.status === 0) {
            this.successMessage.set('Customer updated successfully! Redirecting...');
            this.router.navigate(['/customers']);
          } else {
            this.errorMessage.set(response.message || 'Failed to update customer.');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'An error occurred during customer update.');
        }
      });
    } else {
      payload.balance = this.addForm.value.initialBalance;
      this.customerService.createCustomer(payload).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response && response.status === 0) {
            this.successMessage.set('Customer registered successfully! Redirecting...');
            this.router.navigate(['/customers']);
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
  }

  goBack() {
    this.router.navigate(['/customers']);
  }
}
