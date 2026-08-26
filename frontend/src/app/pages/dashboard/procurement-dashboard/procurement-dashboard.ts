import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService, ProcurementDashboardData } from '../../../services/dashboard.service';

@Component({
  selector: 'app-procurement-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './procurement-dashboard.html',
  styleUrl: './procurement-dashboard.scss'
})
export class ProcurementDashboard implements OnInit {

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  dashboardTitle = 'Procurement Manager Dashboard';
  dashboardSubtitle = 'Manage procurement activities, contracts, communications, and analytics.';
  welcomeTitle = 'Hello Procurement Manager 👋';
  welcomeMessage = 'Manage vendors, procurement activities, purchase orders, contracts, discussions, and file sharing from one centralized dashboard.';

  searchText = '';
  showSearch = false;
  showNotifications = false;

  notifications: string[] = [
    'A new vendor is awaiting approval.',
    'Purchase Order PO-1052 has been created.',
    'Contract renewal is due in 3 days.'
  ];

  procurementMetrics: ProcurementDashboardData | null = null;

  menuItems = [
    { title: 'Vendor Management', icon: 'business' },
    { title: 'Vendor Performance', icon: 'trending_up' },
    { title: 'Vendor Reliability', icon: 'verified_user' },
    { title: 'Procurement', icon: 'shopping_cart' },
    { title: 'Purchase Orders', icon: 'inventory_2' },
    { title: 'Contract Repository', icon: 'description' },
    { title: 'Contract Renewals', icon: 'autorenew' },
    { title: 'Compliance Monitoring', icon: 'verified' },
    { title: 'Certifications', icon: 'workspace_premium' },
    { title: 'Vendor Documents', icon: 'folder_open' },
    { title: 'Communication', icon: 'forum' },
    { title: 'Procurement Discussions', icon: 'forum' },
    { title: 'Dashboard Analytics', icon: 'dashboard' },
    { title: 'Notification Center', icon: 'notifications' },
    { title: 'Reports & Export', icon: 'bar_chart' }
  ];

  ngOnInit(): void {
    this.loadProcurementMetrics();
  }

  loadProcurementMetrics(): void {
    this.dashboardService.getProcurementDashboard().subscribe({
      next: (data) => {
        this.procurementMetrics = data;
      },
      error: (err) => {
        console.warn('Dashboard service fallback:', err);
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
    this.router.navigate(['/login']);
  }

  openModule(moduleName: string) {
    switch (moduleName) {
      case 'Vendor Management':
        this.router.navigate(['/vendor-management']);
        break;
      case 'Vendor Performance':
      case 'Vendor Performance Dashboard':
        this.router.navigate(['/vendor-performance-dashboard']);
        break;
      case 'Vendor Reliability':
      case 'Vendor Reliability Dashboard':
        this.router.navigate(['/vendor-reliability-dashboard']);
        break;
      case 'Procurement':
        this.router.navigate(['/procurement-management']);
        break;
      case 'Purchase Orders':
        this.router.navigate(['/purchase-orders']);
        break;
      case 'Contract Repository':
      case 'Contracts':
        this.router.navigate(['/contract-repository']);
        break;
      case 'Contract Renewals':
        this.router.navigate(['/contract-renewal-dashboard']);
        break;
      case 'Compliance Monitoring':
        this.router.navigate(['/compliance-dashboard']);
        break;
      case 'Certifications':
        this.router.navigate(['/certification-management']);
        break;
      case 'Vendor Documents':
        this.router.navigate(['/vendor-documentation']);
        break;
      case 'Communication':
      case 'Communication Dashboard':
        this.router.navigate(['/communication-dashboard']);
        break;
      case 'Vendor Messaging':
        this.router.navigate(['/vendor-messaging']);
        break;
      case 'Procurement Discussions':
        this.router.navigate(['/procurement-discussions']);
        break;
      case 'File Sharing':
        this.router.navigate(['/file-sharing']);
        break;
      case 'Activity Logs':
        this.router.navigate(['/activity-logs']);
        break;
      case 'Dashboard Analytics':
        this.router.navigate(['/admin-analytics']);
        break;
      case 'Notification Center':
      case 'Notifications':
        this.router.navigate(['/notification-center']);
        break;
      case 'Reports & Export':
      case 'Reports':
        this.router.navigate(['/reports']);
        break;
      default:
        this.router.navigate(['/procurement-management']);
    }
  }
}