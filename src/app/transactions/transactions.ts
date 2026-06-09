import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '../common-service/common-service';
import { environment } from '../environments/environment';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SidebarService } from '../sidebar/service/sidebar-service';

export interface BankAccount {
  accountNumber: string;
  firstName: string;
  lastName: string;
  balance: number;
}

export interface Transaction {
  id: number;
  accountNumber: string;
  transactionType: string;
  amount: number;
  postBalance: number;
  timestamp: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar, Header, Footer],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  sidebarService = inject(SidebarService);
  private commonService = inject(CommonService);
  private fb = inject(FormBuilder);

  accounts = signal<BankAccount[]>([]);
  selectedAccountNumber = signal<string>('');
  transactions = signal<Transaction[]>([]);

  isLoading = signal(false);
  isLoadingAccounts = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filter Form
  filterForm: FormGroup = this.fb.group({
    dateFilter: [''] // Format: yyyy-MM-dd
  });

  ngOnInit() {
    this.fetchAccounts();
  }

  fetchAccounts() {
    this.isLoadingAccounts.set(true);
    const url = `${environment.BASE_API_URL}bank`;

    this.commonService.get<any>(url).subscribe({
      next: (response) => {
        this.isLoadingAccounts.set(false);
        if (response && response.status === 0) {
          this.accounts.set(response.data || []);
          if (this.accounts().length > 0) {
            // Auto-select first account to show its transactions
            this.selectedAccountNumber.set(this.accounts()[0].accountNumber);
            this.fetchTransactions();
          }
        }
      },
      error: () => {
        this.isLoadingAccounts.set(false);
      }
    });
  }

  onAccountChange(event: any) {
    this.selectedAccountNumber.set(event.target.value);
    this.fetchTransactions();
  }

  onDateChange() {
    this.fetchTransactions();
  }

  clearDateFilter() {
    this.filterForm.patchValue({ dateFilter: '' });
    this.fetchTransactions();
  }

  fetchTransactions() {
    const activeNo = this.selectedAccountNumber();
    if (!activeNo) {
      this.transactions.set([]);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    let date = this.filterForm.value.dateFilter || '';
    let url = `${environment.BASE_API_URL}bank/${activeNo}/transactions`;
    if (date) {
      url += `?date=${date}`;
    }

    this.commonService.get<any>(url).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.transactions.set(response.data || []);
        } else {
          this.errorMessage.set(response.message || 'No transactions found.');
          this.transactions.set([]);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred while loading transactions.');
        this.transactions.set([]);
      }
    });
  }

  getTransactionClass(type: string): string {
    const t = type.toUpperCase();
    if (t.includes('DEPOSIT') || t.includes('IN') || t.includes('INITIAL')) {
      return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    }
    return 'text-rose-700 bg-rose-50 border-rose-100';
  }

  getTransactionIcon(type: string): string {
    const t = type.toUpperCase();
    if (t.includes('DEPOSIT') || t.includes('IN') || t.includes('INITIAL')) {
      return 'arrow_downward';
    }
    return 'arrow_upward';
  }

  isCredit(type: string): boolean {
    const t = type.toUpperCase();
    return t.includes('DEPOSIT') || t.includes('IN') || t.includes('INITIAL');
  }
}
