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

    this.showNotifications = !this.showNotifications;

  }

  goToProfile() {

    this.router.navigate(['/profile']);

  }

  logout() {

    this.router.navigate(['/login']);

  }

  openModule(name: string) {

    alert(`${name}\n\nThis module will be implemented in the next milestone.`);

  }

}