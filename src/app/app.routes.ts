import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login-administrator/login-administrator').then(m => m.LoginAdministrator), },
    { path: 'dashboard', loadComponent: () => import('./dashboard-administrator/dashboard-administrator').then(m => m.DashboardAdministrator) }
];
