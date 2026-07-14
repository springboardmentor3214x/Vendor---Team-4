import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './finance-dashboard.html',
  styleUrl: './finance-dashboard.scss'
})
export class FinanceDashboard {

  constructor(private router: Router) {}

  // Dashboard Information

  dashboardTitle = 'Finance Officer Dashboard';

  dashboardSubtitle = 'Manage invoices, payments, and purchase orders.';

  welcomeTitle = 'Hello Finance Officer 👋';

  welcomeMessage =
    'Monitor purchase orders, manage invoices, and track payment details efficiently.';

  // Search

  searchText = '';

  showSearch = false;

  // Notifications

  showNotifications = false;

  notifications = [
    'Invoice INV-1023 has been approved.',
    'Payment for Vendor ABC is due tomorrow.',
    'A new purchase order requires financial review.'
  ];

  // Sidebar & Cards

  menuItems = [
    {
      title: 'Purchase Orders',
      icon: 'shopping_cart'
    },
    {
      title: 'Invoice Management',
      icon: 'receipt_long'
    },
    {
      title: 'Payment Details',
      icon: 'payments'
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

    case 'Purchase Orders':
      this.router.navigate(['/purchase-orders']);
      break;

    case 'Invoice Management':
      alert(
        
      );
      break;

    case 'Payment Details':
      alert(
        
      );
      break;

    default:
      alert(
        
      );

  }

}

}