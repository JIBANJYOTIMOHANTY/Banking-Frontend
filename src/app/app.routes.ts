import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Authguard } from './authguard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login-administrator/login-administrator').then(m => m.LoginAdministrator), },
    { path: 'signup', loadComponent: () => import('./login-administrator/login-administrator').then(m => m.LoginAdministrator), },
    { path: 'dashboard', loadComponent: () => import('./dashboard-administrator/dashboard-administrator').then(m => m.DashboardAdministrator), canActivate: [() => inject(Authguard).canActivate()] },
    { path: 'accounts', loadComponent: () => import('./accounts/accounts').then(m => m.Accounts), canActivate: [() => inject(Authguard).canActivate()] },
    { path: 'transactions', loadComponent: () => import('./transactions/transactions').then(m => m.Transactions), canActivate: [() => inject(Authguard).canActivate()] },
    { path: 'customers', loadComponent: () => import('./customers-management/customers-management').then(m => m.CustomersManagement), canActivate: [() => inject(Authguard).canActivate()] },
    { path: 'customers/add', loadComponent: () => import('./customers-management/customer-details/customer-details').then(m => m.CustomerDetails), canActivate: [() => inject(Authguard).canActivate()] },
    { path: 'customers/edit/:accountNumber', loadComponent: () => import('./customers-management/customer-details/customer-details').then(m => m.CustomerDetails), canActivate: [() => inject(Authguard).canActivate()] },
    { path: '**', redirectTo: 'login' }
];
