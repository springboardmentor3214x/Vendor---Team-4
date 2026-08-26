import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService, VendorDashboardData } from '../../../services/dashboard.service';
import { VendorService } from '../../../services/vendor.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.scss'
})
export class VendorDashboard implements OnInit {

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private vendorService: VendorService
  ) {}

  dashboardTitle = 'Vendor Dashboard';
  dashboardSubtitle = 'Manage your profile, orders, contracts, and communication.';
  welcomeTitle = 'Hello Vendor 👋';
  welcomeMessage = 'Welcome to the Vendor Portal. Manage your profile, view orders, track contracts, and communicate with your procurement team from one place.';

  searchText = '';
  showSearch = false;
  showNotifications = false;

  notifications = [
    'A new purchase order has been assigned.',
    'Your contract renewal is due next week.',
    'A message has been received from Procurement.'
  ];

  vendorMetrics: VendorDashboardData | null = null;

  menuItems = [
    { title: 'Vendor Profile', icon: 'business' },
    { title: 'Orders', icon: 'shopping_bag' },
    { title: 'Vendor Performance', icon: 'trending_up' },
    { title: 'Contract Repository', icon: 'description' },
    { title: 'Vendor Documents', icon: 'folder_open' },
    { title: 'Communication', icon: 'forum' },
    { title: 'Vendor Analytics', icon: 'analytics' }
  ];

  ngOnInit(): void {
    this.loadVendorMetrics();
  }

  loadVendorMetrics(): void {
    this.dashboardService.getVendorDashboard().subscribe({
      next: (data) => {
        this.vendorMetrics = data;
      },
      error: (err) => {
        console.warn('Vendor dashboard metrics fallback:', err);
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
    this.vendorService.getMyVendorProfile().subscribe({
      next: (vendor) => this.router.navigate(['/edit-vendor', vendor.id]),
      error: (err) => {
        console.error('Unable to load vendor profile', err);
        alert(err?.error?.detail || 'Unable to open your vendor profile.');
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  openModule(moduleName: string) {
    switch (moduleName) {
      case 'Vendor Profile':
        this.goToProfile();
        break;
      case 'Vendor Analytics':
        this.router.navigate(['/vendor-analytics']);
        break;
      case 'Vendor Performance':
      case 'Vendor Performance Dashboard':
        this.router.navigate(['/vendor-ranking']);
        break;
      case 'Orders':
        this.router.navigate(['/purchase-orders']);
        break;
      case 'Contract Repository':
      case 'Contracts':
        this.router.navigate(['/contract-repository']);
        break;
      case 'Vendor Documents':
        this.router.navigate(['/vendor-documentation']);
        break;
      case 'Communication':
      case 'Communication Dashboard':
        this.router.navigate(['/vendor-messaging']);
        break;
      case 'Vendor Messaging':
        this.router.navigate(['/vendor-messaging']);
        break;
      case 'File Sharing':
        this.router.navigate(['/file-sharing']);
        break;
      default:
        alert(`${moduleName} module opened.`);
    }
  }
}