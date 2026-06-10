import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsService } from './service/accounts-service';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SidebarService } from '../sidebar/service/sidebar-service';

export interface BankAccount {
  id?: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar, Header, Footer],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts implements OnInit {
  sidebarService = inject(SidebarService);
  private accountsService = inject(AccountsService);
  private fb = inject(FormBuilder);

  accounts = signal<BankAccount[]>([]);
  searchQuery = signal<string>('');
  selectedAccount = signal<BankAccount | null>(null);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Operation Tab: 'deposit' | 'withdraw' | 'transfer' | 'settings'
  activeTab = signal<'deposit' | 'withdraw' | 'transfer' | 'settings'>('deposit');

  // Modal control
  isDeleteConfirmOpen = signal(false);
  isAddAccountOpen = signal(false);

  // Computed state
  filteredAccounts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.accounts();
    if (!query) {
      return list;
    }
    return list.filter(a =>
      a.accountNumber.toLowerCase().includes(query) ||
      a.firstName.toLowerCase().includes(query) ||
      a.lastName.toLowerCase().includes(query)
    );
  });

  totalBalanceSum = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + acc.balance, 0);
  });

  // Forms
  depositForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]]
  });

  withdrawForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]]
  });

  transferForm: FormGroup = this.fb.group({
    destAccountNumber: ['', [Validators.required, Validators.pattern(/^ACC\d+$/)]],
    amount: [null, [Validators.required, Validators.min(1)]]
  });

  addAccountForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    initialBalance: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.fetchAccounts();
  }

  fetchAccounts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.accountsService.getAccounts().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.accounts.set(response.data || []);

          // Re-select active account if it was updated
          const currentSel = this.selectedAccount();
          if (currentSel) {
            const updated = this.accounts().find(a => a.accountNumber === currentSel.accountNumber);
            this.selectedAccount.set(updated || null);
          }
        } else {
          this.errorMessage.set(response.message || 'Failed to fetch accounts.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Error occurred while loading accounts.');
      }
    });
  }

  onSearch(event: any) {
    this.searchQuery.set(event.target.value);
  }

  selectAccount(account: BankAccount) {
    this.selectedAccount.set(account);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.depositForm.reset();
    this.withdrawForm.reset();
    this.transferForm.reset();
  }

  executeDeposit() {
    const currentSel = this.selectedAccount();
    if (this.depositForm.invalid || !currentSel) {
      this.depositForm.markAllAsTouched();
      return;
    }

    const amount = this.depositForm.value.amount;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accountsService.deposit(currentSel.accountNumber, amount).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.successMessage.set(`Successfully deposited ₹${amount} into ${currentSel.accountNumber}`);
          this.depositForm.reset();
          this.fetchAccounts();
        } else {
          this.errorMessage.set(response.message || 'Deposit operation failed.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred during deposit.');
      }
    });
  }

  executeWithdraw() {
    const currentSel = this.selectedAccount();
    if (this.withdrawForm.invalid || !currentSel) {
      this.withdrawForm.markAllAsTouched();
      return;
    }

    const amount = this.withdrawForm.value.amount;
    if (amount > currentSel.balance) {
      this.errorMessage.set('Withdrawal amount exceeds current balance.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accountsService.withdraw(currentSel.accountNumber, amount).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.successMessage.set(`Successfully withdrew ₹${amount} from ${currentSel.accountNumber}`);
          this.withdrawForm.reset();
          this.fetchAccounts();
        } else {
          this.errorMessage.set(response.message || 'Withdrawal operation failed.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred during withdrawal.');
      }
    });
  }

  executeTransfer() {
    const currentSel = this.selectedAccount();
    if (this.transferForm.invalid || !currentSel) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const dest = this.transferForm.value.destAccountNumber;
    const amount = this.transferForm.value.amount;

    if (dest === currentSel.accountNumber) {
      this.errorMessage.set('Cannot transfer money to the same account.');
      return;
    }

    if (amount > currentSel.balance) {
      this.errorMessage.set('Transfer amount exceeds current balance.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accountsService.transfer(currentSel.accountNumber, dest, amount).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.successMessage.set(`Successfully transferred ₹${amount} to ${dest}`);
          this.transferForm.reset();
          this.fetchAccounts();
        } else {
          this.errorMessage.set(response.message || 'Transfer operation failed.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred during transfer.');
      }
    });
  }

  openDeleteConfirm() {
    this.isDeleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.isDeleteConfirmOpen.set(false);
  }

  executeDeleteAccount() {
    const currentSel = this.selectedAccount();
    if (!currentSel) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accountsService.deleteAccount(currentSel.accountNumber).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isDeleteConfirmOpen.set(false);
        if (response && response.status === 0) {
          this.successMessage.set(`Account ${currentSel.accountNumber} deleted successfully.`);
          this.selectedAccount.set(null);
          this.fetchAccounts();
        } else {
          this.errorMessage.set(response.message || 'Failed to delete account.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isDeleteConfirmOpen.set(false);
        this.errorMessage.set(err.message || 'An error occurred during deletion.');
      }
    });
  }

  openAddAccount() {
    this.addAccountForm.reset({ firstName: '', lastName: '', initialBalance: 0 });
    this.isAddAccountOpen.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  closeAddAccount() {
    this.isAddAccountOpen.set(false);
  }

  executeCreateAccount() {
    if (this.addAccountForm.invalid) {
      this.addAccountForm.markAllAsTouched();
      return;
    }

    const payload = {
      firstName: this.addAccountForm.value.firstName,
      lastName: this.addAccountForm.value.lastName,
      balance: this.addAccountForm.value.initialBalance
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accountsService.createAccount(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.status === 0) {
          this.successMessage.set('Account created successfully!');
          this.fetchAccounts();
          setTimeout(() => this.closeAddAccount(), 1500);
        } else {
          this.errorMessage.set(response.message || 'Failed to create account.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred during account creation.');
      }
    });
  }
}
