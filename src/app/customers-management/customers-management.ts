import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  customers = signal<Customer[]>([]);
  searchQuery = signal<string>('');

  filteredCustomers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.customers();
    if (!query) {
      return list;
    }
    return list.filter(c =>
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.accountNumber.toLowerCase().includes(query)
    );
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Modals state
  isAddModalOpen = signal(false);
  isEditModalOpen = signal(false);
  selectedCustomer = signal<Customer | null>(null);

  // Forms
  addForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
  });

  editForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const url = `${environment.BASE_API_URL}bank`;

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

  openAddModal() {
    this.addForm.reset({ firstName: '', lastName: '', initialBalance: 0 });
    this.isAddModalOpen.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  openEditModal(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.editForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
    });
    this.isEditModalOpen.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedCustomer.set(null);
  }

  submitAddCustomer() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const payload = {
      firstName: this.addForm.value.firstName,
      lastName: this.addForm.value.lastName,
      balance: this.addForm.value.initialBalance
    };

    this.isLoading.set(true);
    const url = `${environment.BASE_API_URL}bank`;

    this.commonService.post<any>(url, payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.successMessage.set('Customer registered successfully!');
          this.fetchCustomers();
          setTimeout(() => this.closeAddModal(), 1500);
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

  submitEditCustomer() {
    const customerVal = this.selectedCustomer();
    if (this.editForm.invalid || !customerVal) {
      this.editForm.markAllAsTouched();
      return;
    }

    const payload = {
      accountNumber: customerVal.accountNumber,
      firstName: this.editForm.value.firstName,
      lastName: this.editForm.value.lastName
    };

    this.isLoading.set(true);
    const url = `${environment.BASE_API_URL}bank`;

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
