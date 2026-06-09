import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login-administrator/login-administrator').then(m => m.LoginAdministrator), },
    { path: 'dashboard', loadComponent: () => import('./dashboard-administrator/dashboard-administrator').then(m => m.DashboardAdministrator) },
    { path: 'accounts', loadComponent: () => import('./accounts/accounts').then(m => m.Accounts), },
    { path: 'transactions', loadComponent: () => import('./transactions/transactions').then(m => m.Transactions), },
    { path: 'customers', loadComponent: () => import('./customers-management/customers-management').then(m => m.CustomersManagement) },
    { path: '**', redirectTo: 'login' }
];
