import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SidebarService } from '../sidebar/service/sidebar-service';
import { AccountsService } from '../accounts/service/accounts-service';
import { TransactionsService } from '../transactions/service/transactions-service';
import { CustomTable } from '../custom-tables/custom-table';
import { TableColumn } from '../custom-tables/custom-table-models/custom-table-model';
import { CustomSkeletonLoading } from '../custom-tables/custom-skeleton-loading/custom-skeleton-loading';

@Component({
  selector: 'app-dashboard-administrator',
  imports: [Sidebar, Header, Footer, CustomTable, CustomSkeletonLoading],
  templateUrl: './dashboard-administrator.html',
  styleUrl: './dashboard-administrator.css',
})
export class DashboardAdministrator implements OnInit {
  sidebarService = inject(SidebarService);
  private accountsService = inject(AccountsService);
  private transactionsService = inject(TransactionsService);
  private router = inject(Router);

  totalCustomers = signal(0);
  accountsOpen = signal(0);
  totalDeposits = signal(0);
  totalTransactionsCount = signal(0);
  recentTransactions = signal<any[]>([]);
  isLoadingTransactions = signal(false);
  isLoadingAccounts = signal(false);
  recentAccounts = signal<any[]>([]);
  recentTxColumns: TableColumn[] = [
    { key: 'id', header: 'Transaction ID', type: 'text', prefix: 'TXN' },
    { key: 'accountNumber', header: 'Account Number', type: 'text' },
    { key: 'amount', header: 'Amount', type: 'currency' },
    { key: 'transactionType', header: 'Type', type: 'text' },
    { key: 'status', header: 'Status', type: 'badge' }
  ];
  userFirstName = signal('Sarah');
  userLastName = signal('Jenkins');

  customersTrend = signal('+0.0%');
  accountsTrend = signal('+0.0%');
  depositsTrend = signal('+0.0%');
  transactionsTrend = signal('Real-time');

  private totalSystemBalance = 0;
  private recentDepositSum = 0;

  formatAmount(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    const absValue = Math.abs(value);
    if (absValue >= 1e12) {
      return value.toExponential(2);
    }
    if (absValue >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B';
    }
    if (absValue >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M';
    }
    if (absValue >= 1e3) {
      return (value / 1e3).toFixed(2) + 'K';
    }
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  formatPercentTrend(pct: number): string {
    const sign = pct >= 0 ? '+' : '';
    if (Math.abs(pct) >= 1e4) {
      return sign + pct.toExponential(1) + '%';
    }
    return sign + pct.toFixed(1) + '%';
  }

  private updateDepositsTrend() {
    let depositPct = 0;
    if (this.totalSystemBalance > 0) {
      depositPct = (this.recentDepositSum / this.totalSystemBalance) * 100;
    }
    this.depositsTrend.set(this.formatPercentTrend(depositPct));
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      try {
        const storedFirstName = localStorage.getItem('firstName');
        const storedLastName = localStorage.getItem('lastName');
        if (storedFirstName) this.userFirstName.set(storedFirstName);
        if (storedLastName) this.userLastName.set(storedLastName);
      } catch (e) {
        console.error('Failed to load user name from storage', e);
      }
      this.loadAccounts();
      this.loadTransactions();
    }
  }

  loadAccounts() {
    this.isLoadingAccounts.set(true);
    this.accountsService.getAccounts().subscribe({
      next: (response: any) => {
        this.isLoadingAccounts.set(false);
        if (response && response.status === 0) {
          const accounts = response.data || [];
          this.totalCustomers.set(accounts.length);
          this.accountsOpen.set(accounts.length);

          const sum = accounts.reduce((total: number, acc: any) => total + acc.balance, 0);
          this.totalSystemBalance = sum;
          this.updateDepositsTrend();

          // Calculate 24h trend threshold
          const now = new Date();
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const year = oneDayAgo.getFullYear();
          const month = String(oneDayAgo.getMonth() + 1).padStart(2, '0');
          const day = String(oneDayAgo.getDate()).padStart(2, '0');
          const hours = String(oneDayAgo.getHours()).padStart(2, '0');
          const minutes = String(oneDayAgo.getMinutes()).padStart(2, '0');
          const seconds = String(oneDayAgo.getSeconds()).padStart(2, '0');
          const thresholdStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

          const createdRecently = accounts.filter((acc: any) => {
            const createdAt = acc.created_at || '';
            return createdAt >= thresholdStr;
          }).length;

          const previousCount = accounts.length - createdRecently;
          let pct = 0;
          if (previousCount > 0) {
            pct = (createdRecently / previousCount) * 100;
          } else if (createdRecently > 0) {
            pct = 100;
          }
          this.accountsTrend.set(this.formatPercentTrend(pct));
          this.customersTrend.set(this.formatPercentTrend(pct));

          // Get the 3 most recently created accounts
          const sorted = [...accounts].sort((a, b) => b.id - a.id);
          this.recentAccounts.set(sorted.slice(0, 3));
        }
      },
      error: (err) => {
        this.isLoadingAccounts.set(false);
        console.error('Failed to load accounts for dashboard:', err);
      }
    });
  }

  loadTransactions() {
    this.isLoadingTransactions.set(true);
    this.transactionsService.getAllTransactions().subscribe({
      next: (response: any) => {
        this.isLoadingTransactions.set(false);
        if (response && response.status === 0) {
          const txs = response.data || [];
          this.totalTransactionsCount.set(txs.length);

          // Get calendar day string (yyyy-MM-dd)
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          const todayStr = `${y}-${m}-${d}`;

          const todayTxs = txs.filter((tx: any) => {
            const timestamp = tx.timestamp || '';
            return timestamp.startsWith(todayStr);
          });

          const todayDepositSum = todayTxs
            .filter((tx: any) => tx.transactionType === 'DEPOSIT' || tx.transactionType === 'INITIAL_DEPOSIT')
            .reduce((sum: number, tx: any) => sum + tx.amount, 0);

          this.recentDepositSum = todayDepositSum;
          this.totalDeposits.set(todayDepositSum);
          this.updateDepositsTrend();

          // Transactions trend
          const txsToday = todayTxs.length;
          this.transactionsTrend.set(`+${txsToday} today`);

          // Sort lexicographically by timestamp descending (yyyy-MM-dd HH:mm:ss format)
          const sorted = [...txs].sort((a, b) => {
            const tA = a.timestamp || '';
            const tB = b.timestamp || '';
            return tB.localeCompare(tA);
          });
          const mappedTxs = sorted.slice(0, 3).map(tx => ({
            ...tx,
            status: 'Success'
          }));
          this.recentTransactions.set(mappedTxs);
        }
      },
      error: (err) => {
        this.isLoadingTransactions.set(false);
        console.error('Failed to load transactions for dashboard:', err);
      }
    });
  }

  selectAccount(account: any) {
    this.router.navigate(['/customers/edit', account.accountNumber]);
  }

  navigateToAccounts() {
    this.router.navigate(['/accounts']);
  }

  navigateToTransactions() {
    this.router.navigate(['/transactions']);
  }
}

