import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-supply-chain-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './supply-chain-dashboard.html',
  styleUrl: './supply-chain-dashboard.scss'
})
export class SupplyChainDashboard {

  constructor(private router: Router) {}

  // Dashboard Information

  dashboardTitle = 'Supply Chain Manager Dashboard';

  dashboardSubtitle = 'Monitor vendor performance and supply chain operations.';

  welcomeTitle = 'Hello Supply Chain Manager 👋';

  welcomeMessage =
    'Track vendor performance, monitor vendor reliability, and oversee procurement progress across the supply chain.';

  // Search

  searchText = '';

  showSearch = false;

  // Notifications

  showNotifications = false;

  notifications = [
    'Vendor reliability score has been updated.',
    'Procurement tracking report is available.',
    'Supply chain performance review is scheduled tomorrow.'
  ];

  // Sidebar & Dashboard Cards

  menuItems = [
    {
      title: 'Vendor Performance',
      icon: 'trending_up'
    },
    {
      title: 'Vendor Reliability',
      icon: 'verified'
    },
    {
      title: 'Procurement Tracking',
      icon: 'local_shipping'
    }
  ];

  get filteredItems() {
    return this.menuItems.filter(item =>
      item.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  toggleNotifications() {

  this.router.navigate(['/notifications']);

}

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {

  localStorage.removeItem('token');
  localStorage.removeItem('role');

  this.router.navigate(['/login']);

}

  openModule(moduleName: string) {

  switch (moduleName) {

    case 'Vendor Performance':
      this.router.navigate(['/vendor-performance-dashboard']);
      break;

    case 'Vendor Reliability':
      alert(
        
      );
      break;

    case 'Procurement Tracking':
      alert(
        
      );
      break;

    default:
      alert(
        
      );

  }

}

}