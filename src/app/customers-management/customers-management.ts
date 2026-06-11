import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SidebarService } from '../sidebar/service/sidebar-service';
import { CustomTable } from '../custom-tables/custom-table';
import { TableColumn } from '../custom-tables/custom-table-models/custom-table-model';
import { CustomSkeletonLoading } from '../custom-tables/custom-skeleton-loading/custom-skeleton-loading';

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
  imports: [CommonModule, Sidebar, Header, Footer, CustomTable, CustomSkeletonLoading],
  templateUrl: './customers-management.html',
  styleUrl: './customers-management.css',
})
export class CustomersManagement implements OnInit {
  sidebarService = inject(SidebarService);
  private commonService = inject(CommonService);
  private router = inject(Router);

  customers = signal<Customer[]>([]);
  searchQuery = signal<string>('');
  totalCustomersCount = signal<number>(0);
  expandedCustomerNo = signal<string | null>(null);

  customerColumns: TableColumn[] = [
    { key: 'customerProfile', header: 'Customer Profile', type: 'customer-profile' },
    { key: 'accountNumber', header: 'Account Number', type: 'badge-mono' },
    { key: 'created_at', header: 'Created Date', type: 'text' },
    { key: 'balance', header: 'Available Balance', type: 'currency' },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      align: 'right',
      buttons: [
        {
          label: (row) => this.expandedCustomerNo() === row.accountNumber ? 'Collapse' : 'Details',
          icon: (row) => this.expandedCustomerNo() === row.accountNumber ? 'expand_less' : 'expand_more',
          actionName: 'expand'
        },
        {
          label: 'Edit',
          icon: 'edit',
          actionName: 'edit'
        }
      ]
    }
  ];

  handleTableAction(event: { action: string; row: any }) {
    if (event.action === 'expand') {
      this.toggleExpandCustomer(event.row.accountNumber);
    } else if (event.action === 'edit') {
      this.openEditPage(event.row);
    }
  }

  filteredCustomers = computed(() => {
    return this.customers();
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  private searchTimeout: any;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.fetchCustomers();
    }
  }

  fetchCustomers() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const query = this.searchQuery().trim();
    this.commonService.post<any>(`${environment.BASE_API_URL}bank/customer/search`, { query: query || '' }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          const list = response.data || [];
          this.customers.set(list);
          if (!query) {
            this.totalCustomersCount.set(list.length);
          }
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
    const val = event.target.value;
    this.searchQuery.set(val);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.fetchCustomers();
    }, 300);
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

  openEditPage(customer: Customer) {
    this.router.navigate(['/customers/edit', customer.accountNumber]);
  }
}
