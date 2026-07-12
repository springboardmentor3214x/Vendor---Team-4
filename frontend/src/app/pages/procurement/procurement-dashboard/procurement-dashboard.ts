import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-procurement-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './procurement-dashboard.html',
  styleUrl: './procurement-dashboard.scss'
})
export class ProcurementDashboard {

  constructor(private router: Router) {}

  totalProcurements = 0;
  pending = 0;
  approved = 0;
  completed = 0;

  recentActivities = [
    {
      id: 'PR001',
      item: 'Laptop Purchase',
      status: 'Pending'
    },
    {
      id: 'PR002',
      item: 'Office Chairs',
      status: 'Approved'
    },
    {
      id: 'PR003',
      item: 'Network Switch',
      status: 'Completed'
    }
  ];

  procurementList() {

    console.log('Navigate to Procurement List');

    // this.router.navigate(['/procurement-list']);

  }

  addProcurement() {

    console.log('Navigate to Add Procurement');

    // this.router.navigate(['/add-procurement']);

  }

  purchaseOrders() {

    this.router.navigate(['/purchase-orders']);

  }

  tracking() {

    console.log('Navigate to Procurement Tracking');

    // this.router.navigate(['/procurement-tracking']);

  }

}