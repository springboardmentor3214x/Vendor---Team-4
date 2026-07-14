import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
export class AdminDashboard {

  constructor(private router: Router) {}

  searchText = '';

  showSearch = false;

  showNotifications = false;

  notifications = [
    'New vendor registration pending approval.',
    'Monthly procurement report is ready.',
    'Vendor ABC profile was updated.'
  ];

  menuItems = [

    {
      title: 'User Management',
      icon: 'groups'
    },

    {
      title: 'Vendor Management',
      icon: 'business'
    },

    {
      title: 'Procurement',
      icon: 'shopping_cart'
    },

    {
      title: 'Reports',
      icon: 'bar_chart'
    },

    {
      title: 'Analytics',
      icon: 'analytics'
    },

    {
      title: 'Notifications',
      icon: 'notifications'
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

openModule(name: string) {

  switch (name) {

    case 'Vendor Management':
      this.router.navigate(['/vendor-management']);
      break;

    case 'Procurement':
      this.router.navigate(['/procurement-management']);
      break;

    case 'Reports':
      this.router.navigate(['/reports']);
      break;

    case 'Analytics':
      this.router.navigate(['/analytics']);
      break;

    case 'Notifications':
      this.router.navigate(['/notifications']);
      break;
      case 'User Management':
      alert(
     
      );
      break;

    default:
      alert(
     
      );

  }
}
}
