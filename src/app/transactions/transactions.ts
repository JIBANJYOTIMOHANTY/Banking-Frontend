import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TransactionsService } from './service/transactions-service';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SidebarService } from '../sidebar/service/sidebar-service';
import { CustomTable } from '../custom-tables/custom-table';
import { TableColumn } from '../custom-tables/custom-table-models/custom-table-model';
import { CustomSkeletonLoading } from '../custom-tables/custom-skeleton-loading/custom-skeleton-loading';

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
  imports: [CommonModule, ReactiveFormsModule, Sidebar, Header, Footer, CustomTable, CustomSkeletonLoading],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  sidebarService = inject(SidebarService);
  private transactionsService = inject(TransactionsService);
  private fb = inject(FormBuilder);

  accounts = signal<BankAccount[]>([]);
  selectedAccountNumber = signal<string>('');
  transactions = signal<Transaction[]>([]);

  txnColumns: TableColumn[] = [
    { key: 'id', header: 'Statement ID', type: 'mono', prefix: 'TXN#' },
    { key: 'transactionType', header: 'Operation Type', type: 'transaction-type-badge' },
    { key: 'amount', header: 'Transaction Amount', type: 'transaction-amount' },
    { key: 'postBalance', header: 'Remaining Balance', type: 'currency' },
    { key: 'timestamp', header: 'Transaction Date & Time', type: 'text' }
  ];
  totalRecord = signal<number>(0);

  isLoading = signal(false);
  isLoadingAccounts = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filter Form
  filterForm: FormGroup = this.fb.group({
    dateFilter: [''] // Format: yyyy-MM-dd
  });

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.fetchAccounts();
    }
  }

  fetchAccounts() {
    this.isLoadingAccounts.set(true);

    this.transactionsService.getAccounts().subscribe({
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
      this.totalRecord.set(0);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    let date = this.filterForm.value.dateFilter || '';

    this.transactionsService.getTransactions(activeNo, date).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.transactions.set(response.data || []);
          // Accept totalRecords or totalRecord depending on serialization
          this.totalRecord.set(response.totalRecords ?? response.totalRecord ?? 0);
        } else {
          this.errorMessage.set(response.message || 'No transactions found.');
          this.transactions.set([]);
          this.totalRecord.set(0);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred while loading transactions.');
        this.transactions.set([]);
        this.totalRecord.set(0);
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
