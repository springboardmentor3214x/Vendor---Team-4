import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
export class VendorDashboard {

  constructor(private router: Router) {}

  // Dashboard Information

  dashboardTitle = 'Vendor Dashboard';

  dashboardSubtitle = 'Manage your profile, orders, contracts, and communication.';

  welcomeTitle = 'Hello Vendor 👋';

  welcomeMessage =
    'Welcome to the Vendor Portal. Manage your profile, view orders, track contracts, and communicate with your procurement team from one place.';

  // Search

  searchText = '';

  showSearch = false;

  // Notifications

  showNotifications = false;

  notifications = [
    'A new purchase order has been assigned.',
    'Your contract renewal is due next week.',
    'A message has been received from Procurement.'
  ];

  // Sidebar & Dashboard Cards

  menuItems = [
    {
      title: 'Vendor Profile',
      icon: 'business'
    },
    {
      title: 'Orders',
      icon: 'shopping_bag'
    },
    {
      title: 'Contracts',
      icon: 'description'
    },
    {
      title: 'Communication',
      icon: 'chat'
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
    this.showNotifications = !this.showNotifications;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    // JWT token removal will be implemented after backend integration
    this.router.navigate(['/login']);
  }

  openModule(moduleName: string) {
    alert(`${moduleName}\n\nThis module will be implemented in the next milestone.`);
  }

}