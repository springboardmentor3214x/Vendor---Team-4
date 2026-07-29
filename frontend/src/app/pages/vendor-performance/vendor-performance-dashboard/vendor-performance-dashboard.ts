import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-vendor-performance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './vendor-performance-dashboard.html',
  styleUrl: './vendor-performance-dashboard.scss'
})
export class VendorPerformanceDashboard {

  constructor(private router: Router) {}

  // ================= Dashboard Statistics =================

  totalVendors = 25;
  averageDelivery = 92;
  averageQuality = 4.6;
  averageResponse = 3.2;
  completedOrders = 184;
  delayedDeliveries = 12;
  rankedVendors = 25;

  // ================= Table =================

  displayedColumns: string[] = [
    'vendor',
    'purchaseOrder',
    'activity',
    'date',
    'status'
  ];

  activities = [
    {
      vendor: 'ABC Suppliers',
      purchaseOrder: 'PO-1001',
      activity: 'Delivery Performance Recorded',
      date: '22 Jul 2026',
      status: 'Completed'
    },
    {
      vendor: 'Global Tech',
      purchaseOrder: 'PO-1002',
      activity: 'Quality Evaluation Submitted',
      date: '21 Jul 2026',
      status: 'Completed'
    },
    {
      vendor: 'Prime Industries',
      purchaseOrder: 'PO-1003',
      activity: 'Communication Logged',
      date: '20 Jul 2026',
      status: 'Updated'
    },
    {
      vendor: 'NextGen Solutions',
      purchaseOrder: 'PO-1004',
      activity: 'Service Rating Submitted',
      date: '19 Jul 2026',
      status: 'Completed'
    },
    {
      vendor: 'Reliable Traders',
      purchaseOrder: 'PO-1005',
      activity: 'Performance History Updated',
      date: '18 Jul 2026',
      status: 'Pending'
    }
  ];

  // ================= Navigation =================

  deliveryPerformance() {
    this.router.navigate(['/delivery-performance']);
  }

  productQualityEvaluation() {
    this.router.navigate(['/product-quality-evaluation']);
  }

  communicationTracking() {
    this.router.navigate(['/communication-tracking']);
  }

  serviceRating() {
    this.router.navigate(['/service-rating']);
  }

  performanceHistory() {
    this.router.navigate(['/performance-history']);
  }

  vendorRanking() {
    this.router.navigate(['/vendor-ranking']);
  }

}