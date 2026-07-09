import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
export class ProcurementDashboard {

  constructor(private router: Router) {}

  // Dashboard Information

  dashboardTitle = 'Procurement Manager Dashboard';

  dashboardSubtitle = 'Manage procurement activities and vendor operations.';

  welcomeTitle = 'Hello Procurement Manager 👋';

  welcomeMessage =
    'Manage vendors, procurement activities, purchase orders, and contracts from one centralized dashboard.';

  // Search

  searchText = '';

  showSearch = false;

  // Notifications

  showNotifications = false;

  notifications = [
    'A new vendor is awaiting approval.',
    'Purchase Order PO-1052 has been created.',
    'Contract renewal is due in 3 days.'
  ];

  // Sidebar & Dashboard Cards

  menuItems = [
    {
      title: 'Vendor Management',
      icon: 'business'
    },
    {
      title: 'Procurement',
      icon: 'shopping_cart'
    },
    {
      title: 'Purchase Orders',
      icon: 'inventory_2'
    },
    {
      title: 'Contracts',
      icon: 'description'
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
    // JWT removal will be added later
    this.router.navigate(['/login']);
  }

  openModule(moduleName: string) {
    alert(`${moduleName}\n\nThis module will be implemented in the next milestone.`);
  }

}