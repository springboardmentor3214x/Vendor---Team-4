import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProcurementService } from '../../../services/procurement.service';

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
export class ProcurementDashboard implements OnInit {

  constructor(
  private router: Router,
  private procurementService: ProcurementService
) {}
ngOnInit(): void {
  this.loadDashboard();
}

  // ================= Statistics =================

  totalRequests = 0;

  pending = 0;

  approved = 0;

  purchaseOrders = 0;

  delivered = 0;

  completed = 0;

  cancelled = 0;

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
  loadDashboard(): void {

  this.procurementService.getDashboard().subscribe({

    next: (data) => {

  this.totalRequests = data.total_requests;
  this.pending = data.pending_requests;
  this.approved = data.approved_requests;
  this.completed = data.completed_requests;
  this.cancelled = data.cancelled_requests;

  // The dashboard API doesn't return these yet,
  // so keep them as 0 for now.
  this.purchaseOrders = 0;
  this.delivered = 0;

},

    error: (err) => {
      console.error(err);
    }

  });

}

}