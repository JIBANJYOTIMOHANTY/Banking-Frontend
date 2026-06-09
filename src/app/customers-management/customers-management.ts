import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SidebarService } from '../sidebar/service/sidebar-service';

export interface Customer {
  id?: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
  dob?: string;
  email?: string;
  mobileNumber?: string;
  govtId?: string;
  govtIdType?: string;
  occupation?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  address?: string;
  pan?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

@Component({
  selector: 'app-customers-management',
  imports: [CommonModule, ReactiveFormsModule, Sidebar, Header, Footer],
  templateUrl: './customers-management.html',
  styleUrl: './customers-management.css',
})
export class CustomersManagement implements OnInit {
  sidebarService = inject(SidebarService);
  private commonService = inject(CommonService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  customers = signal<Customer[]>([]);
  searchQuery = signal<string>('');
  expandedCustomerNo = signal<string | null>(null);

  filteredCustomers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.customers();
    if (!query) {
      return list;
    }
    return list.filter(c =>
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.accountNumber.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.mobileNumber && c.mobileNumber.toLowerCase().includes(query)) ||
      (c.govtId && c.govtId.toLowerCase().includes(query)) ||
      (c.pan && c.pan.toLowerCase().includes(query)) ||
      (c.city && c.city.toLowerCase().includes(query)) ||
      (c.state && c.state.toLowerCase().includes(query)) ||
      (c.country && c.country.toLowerCase().includes(query)) ||
      (c.pincode && c.pincode.toLowerCase().includes(query)) ||
      (c.nomineeName && c.nomineeName.toLowerCase().includes(query)) ||
      (c.address && c.address.toLowerCase().includes(query))
    );
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Modals state (Edit only)
  isEditModalOpen = signal(false);
  selectedCustomer = signal<Customer | null>(null);

  editForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
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
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const url = `${environment.BASE_API_URL}bank/customer`;

    this.commonService.get<any>(url).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.customers.set(response.data || []);
        } else {
          this.errorMessage.set(response.message || 'Failed to fetch customers.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Error occurred while loading customers.');
      }
    });
  }

  onSearch(event: any) {
    this.searchQuery.set(event.target.value);
  }

  toggleExpandCustomer(accountNumber: string) {
    if (this.expandedCustomerNo() === accountNumber) {
      this.expandedCustomerNo.set(null);
    } else {
      this.expandedCustomerNo.set(accountNumber);
    }
  }

  openAddModal() {
    this.router.navigate(['/customers/add']);
  }

  openEditModal(customer: Customer) {
    this.selectedCustomer.set(customer);
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
    this.editForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
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
    this.isEditModalOpen.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedCustomer.set(null);
  }

  submitEditCustomer() {
    const customerVal = this.selectedCustomer();
    if (this.editForm.invalid || !customerVal) {
      this.editForm.markAllAsTouched();
      return;
    }

    const combinedMobileNumber = `${this.editForm.value.countryCode}${this.editForm.value.mobileNumber}`;
    const payload = {
      accountNumber: customerVal.accountNumber,
      firstName: this.editForm.value.firstName,
      lastName: this.editForm.value.lastName,
      dob: this.editForm.value.dob,
      email: this.editForm.value.email,
      mobileNumber: combinedMobileNumber,
      govtId: this.editForm.value.govtId,
      govtIdType: this.editForm.value.govtIdType,
      pan: this.editForm.value.pan,
      occupation: this.editForm.value.occupation,
      nomineeName: this.editForm.value.nomineeName,
      nomineeRelation: this.editForm.value.nomineeRelation,
      address: this.editForm.value.address,
      landmark: this.editForm.value.landmark,
      city: this.editForm.value.city,
      state: this.editForm.value.state,
      country: this.editForm.value.country,
      pincode: this.editForm.value.pincode
    };

    this.isLoading.set(true);
    const url = `${environment.BASE_API_URL}bank/customer`;

    this.commonService.patch<any>(url, payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.successMessage.set('Customer updated successfully!');
          this.fetchCustomers();
          setTimeout(() => this.closeEditModal(), 1500);
        } else {
          this.errorMessage.set(response.message || 'Failed to update customer.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred during customer update.');
      }
    });
  }
}
