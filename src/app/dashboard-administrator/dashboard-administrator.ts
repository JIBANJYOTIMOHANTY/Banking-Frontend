import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-dashboard-administrator',
  imports: [Sidebar, Header, Footer],
  templateUrl: './dashboard-administrator.html',
  styleUrl: './dashboard-administrator.css',
})
export class DashboardAdministrator {
  sidebarOpen = true; // default to true so that the sidebar is visible on page load on desktop
}
