import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, Sidebar, Header, Footer],
  templateUrl: './customers-management.html',
  styleUrl: './customers-management.css',
})
export class CustomersManagement implements OnInit {
  sidebarService = inject(SidebarService);
  private commonService = inject(CommonService);
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

  openEditPage(customer: Customer) {
    this.router.navigate(['/customers/edit', customer.accountNumber]);
  }
}
