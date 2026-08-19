import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminDashboardData, DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  searchText = '';
  showSearch = false;
  showNotifications = false;

  notifications = [
    'New vendor registration pending approval.',
    'Monthly procurement report is ready.',
    'Vendor ABC profile was updated.'
  ];

  adminMetrics: AdminDashboardData | null = null;

  menuItems = [
    { title: 'User Profile & Auth', icon: 'person' },
    { title: 'Vendor Management', icon: 'business' },
    { title: 'Procurement Management', icon: 'shopping_cart' },
    { title: 'Vendor Performance', icon: 'trending_up' },
    { title: 'Contract & Compliance', icon: 'description' },
    { title: 'Communication Hub', icon: 'forum' },
    { title: 'Dashboards & Analytics', icon: 'dashboard' },
    { title: 'Vendor Reliability', icon: 'verified_user' },
    { title: 'Notification Center', icon: 'notifications' },
    { title: 'Reports & Export', icon: 'bar_chart' }
  ];

  ngOnInit(): void {
    this.loadAdminMetrics();
  }

  loadAdminMetrics(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.adminMetrics = data;
      },
      error: (err) => {
        console.warn('Admin dashboard metrics fallback:', err);
      }
    });
  }

  get filteredItems() {
    return this.menuItems.filter(item =>
      item.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  toggleNotifications() {
    this.router.navigate(['/notification-center']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  openModule(name: string) {
    switch (name) {
      case 'User Profile & Auth':
      case 'User Management':
        this.router.navigate(['/profile']);
        break;
      case 'Vendor Management':
        this.router.navigate(['/vendor-management']);
        break;
      case 'Procurement Management':
      case 'Procurement':
        this.router.navigate(['/procurement-management']);
        break;
      case 'Vendor Performance':
      case 'Vendor Performance Dashboard':
        this.router.navigate(['/vendor-performance-dashboard']);
        break;
      case 'Contract & Compliance':
      case 'Contract Repository':
      case 'Compliance Monitoring':
        this.router.navigate(['/contract-repository']);
        break;
      case 'Communication Hub':
      case 'Communication':
      case 'Communication Dashboard':
        this.router.navigate(['/communication-dashboard']);
        break;
      case 'Dashboards & Analytics':
      case 'Admin Analytics':
      case 'Dashboard Analytics':
        this.router.navigate(['/admin-analytics']);
        break;
      case 'Vendor Reliability':
      case 'Vendor Reliability Dashboard':
        this.router.navigate(['/vendor-reliability-dashboard']);
        break;
      case 'Notification Center':
      case 'Notifications':
        this.router.navigate(['/notification-center']);
        break;
      case 'Reports & Export':
      case 'Reports':
        this.router.navigate(['/reports']);
        break;
      case 'Vendor Messaging':
        this.router.navigate(['/vendor-messaging']);
        break;
      case 'File Sharing':
        this.router.navigate(['/file-sharing']);
        break;
      case 'Activity Logs':
        this.router.navigate(['/activity-logs']);
        break;
      default:
        this.router.navigate(['/admin-dashboard']);
    }
  }
}
