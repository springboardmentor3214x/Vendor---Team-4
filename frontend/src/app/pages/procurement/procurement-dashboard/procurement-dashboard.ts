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

  // ================= Statistics =================

  totalRequests = 125;

  pending = 28;

  approved = 46;

  purchaseOrders = 39;

  delivered = 31;

  completed = 24;

  cancelled = 7;

  // ================= Recent Activities =================

  recentActivities = [

    {
      id: 'PR-0001',
      title: 'Laptop Purchase',
      vendor: 'ABC Technologies',
      status: 'Pending',
      date: '21-Jul-2026'
    },

    {
      id: 'PR-0002',
      title: 'Office Chairs',
      vendor: 'XYZ Suppliers',
      status: 'Approved',
      date: '20-Jul-2026'
    },

    {
      id: 'PR-0003',
      title: 'Network Switch',
      vendor: 'Global Office Solutions',
      status: 'Ordered',
      date: '19-Jul-2026'
    },

    {
      id: 'PR-0004',
      title: 'Desktop Computers',
      vendor: 'ABC Technologies',
      status: 'Delivered',
      date: '18-Jul-2026'
    },

    {
      id: 'PR-0005',
      title: 'Printer Cartridges',
      vendor: 'XYZ Suppliers',
      status: 'Completed',
      date: '17-Jul-2026'
    },

    {
      id: 'PR-0006',
      title: 'Projectors',
      vendor: '-',
      status: 'Cancelled',
      date: '16-Jul-2026'
    }

  ];

  // ================= Navigation =================

  procurementList() {

    this.router.navigate(['/procurement-request-list']);

  }

  addProcurement() {

    this.router.navigate(['/procurement-request']);

  }

  purchaseOrdersPage() {

    this.router.navigate(['/purchase-order-details']);

  }

  orderTracking() {

    this.router.navigate(['/order-tracking']);

  }

  invoiceManagement() {

    this.router.navigate(['/invoice-management']);

  }

  vendorAssignment() {

    this.router.navigate(['/vendor-assignment']);

  }

}