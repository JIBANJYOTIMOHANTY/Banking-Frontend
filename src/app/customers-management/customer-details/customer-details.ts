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
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
    dob: ['', [Validators.required]],
    email: ['', [Validators.email]],
    countryCode: ['+91', [Validators.required]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    govtId: ['', [Validators.required]],
    govtIdType: ['aadhar', [Validators.required]],
    pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
    occupation: [''],
    nomineeName: ['', [Validators.pattern(/^[a-zA-Z\s]*$/)]],
    nomineeRelation: [''],
    address: ['', [Validators.required]],
    landmark: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    country: ['', [Validators.required]],
    pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  get controls() {
    return this.addForm.controls;
  }

  ngOnInit() {
    this.addForm.get('govtIdType')?.valueChanges.subscribe(value => {
      this.updateGovtIdValidator(value);
    });

    this.route.paramMap.subscribe(params => {
      const accNum = params.get('accountNumber');
      if (accNum) {
        this.isEditMode.set(true);
        this.accountNumber.set(accNum);
        this.controls['initialBalance']?.clearValidators();
        this.controls['initialBalance']?.updateValueAndValidity();
        if (typeof window !== 'undefined') {
          this.loadCustomerDetails(accNum);
        }
      } else {
        this.isEditMode.set(false);
        this.accountNumber.set(null);
        this.controls['initialBalance']?.setValidators([Validators.required, Validators.min(0)]);
        this.controls['initialBalance']?.updateValueAndValidity();
        this.addForm.reset({
          countryCode: '+91',
          govtIdType: 'aadhar',
          initialBalance: 0
        });
        this.updateGovtIdValidator('aadhar');
      }
    });
  }

  private updateGovtIdValidator(type: string) {
    const govtIdControl = this.addForm.get('govtId');
    if (govtIdControl) {
      if (type === 'aadhar') {
        govtIdControl.setValidators([Validators.required, Validators.pattern(/^[0-9]{12}$/)]);
      } else {
        govtIdControl.setValidators([Validators.required]);
      }
      govtIdControl.updateValueAndValidity({ emitEvent: false });
    }
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

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.isEditMode()) {
      const controls = this.controls;
      const payload: any = {
        accountNumber: this.accountNumber()
      };

      let hasChanges = false;

      if (controls['firstName'].dirty) { payload.firstName = controls['firstName'].value; hasChanges = true; }
      if (controls['lastName'].dirty) { payload.lastName = controls['lastName'].value; hasChanges = true; }
      if (controls['dob'].dirty) { payload.dob = controls['dob'].value; hasChanges = true; }
      if (controls['email'].dirty) { payload.email = controls['email'].value; hasChanges = true; }

      if (controls['countryCode'].dirty || controls['mobileNumber'].dirty) {
        payload.mobileNumber = `${controls['countryCode'].value}${controls['mobileNumber'].value}`;
        hasChanges = true;
      }

      if (controls['govtId'].dirty) { payload.govtId = controls['govtId'].value; hasChanges = true; }
      if (controls['govtIdType'].dirty) { payload.govtIdType = controls['govtIdType'].value; hasChanges = true; }
      if (controls['pan'].dirty) { payload.pan = controls['pan'].value; hasChanges = true; }
      if (controls['occupation'].dirty) { payload.occupation = controls['occupation'].value; hasChanges = true; }
      if (controls['nomineeName'].dirty) { payload.nomineeName = controls['nomineeName'].value; hasChanges = true; }
      if (controls['nomineeRelation'].dirty) { payload.nomineeRelation = controls['nomineeRelation'].value; hasChanges = true; }
      if (controls['address'].dirty) { payload.address = controls['address'].value; hasChanges = true; }
      if (controls['landmark'].dirty) { payload.landmark = controls['landmark'].value; hasChanges = true; }
      if (controls['city'].dirty) { payload.city = controls['city'].value; hasChanges = true; }
      if (controls['state'].dirty) { payload.state = controls['state'].value; hasChanges = true; }
      if (controls['country'].dirty) { payload.country = controls['country'].value; hasChanges = true; }
      if (controls['pincode'].dirty) { payload.pincode = controls['pincode'].value; hasChanges = true; }

      if (!hasChanges) {
        this.isLoading.set(false);
        this.successMessage.set('No changes detected. Redirecting...');
        setTimeout(() => {
          this.router.navigate(['/customers']);
        }, 1500);
        return;
      }

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
        pincode: this.addForm.value.pincode,
        balance: this.addForm.value.initialBalance
      };

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
