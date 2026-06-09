import { Component, inject } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { SidebarService } from '../sidebar/service/sidebar-service';

@Component({
  selector: 'app-dashboard-administrator',
  imports: [Sidebar, Header, Footer],
  templateUrl: './dashboard-administrator.html',
  styleUrl: './dashboard-administrator.css',
})
export class DashboardAdministrator {
  sidebarService = inject(SidebarService);
}
