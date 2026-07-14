import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './auditor-dashboard.html',
  styleUrl: './auditor-dashboard.scss'
})
export class AuditorDashboard {

  constructor(private router: Router) {}

  // Dashboard Information

  dashboardTitle = 'Auditor Dashboard';

  dashboardSubtitle = 'Monitor reports, compliance, and audit activities.';

  welcomeTitle = 'Hello Auditor 👋';

  welcomeMessage =
    'Access reports, review compliance records, and monitor audit logs to ensure organizational transparency.';

  // Search

  searchText = '';

  showSearch = false;

  // Notifications

  showNotifications = false;

  notifications = [
    'New audit report has been generated.',
    'Compliance review scheduled for tomorrow.',
    'Vendor audit log has been updated.'
  ];

  // Sidebar & Cards

  menuItems = [
    {
      title: 'Reports',
      icon: 'bar_chart'
    },
    {
      title: 'Compliance',
      icon: 'verified'
    },
    {
      title: 'Audit Logs',
      icon: 'history'
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

    case 'Reports':
      this.router.navigate(['/reports']);
      break;

    case 'Compliance':
      alert(
        
      );
      break;

    case 'Audit Logs':
      alert(
        
      );
      break;

    default:
      alert(
        
      );

  }

}

}