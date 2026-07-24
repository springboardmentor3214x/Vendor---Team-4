import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-performance-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './performance-history.html',
  styleUrl: './performance-history.scss'
})
export class PerformanceHistory {

  // ================= Vendor Information =================

  vendorName = 'ABC Suppliers';

  vendorCategory = 'Electronics';

  totalOrders = 25;

  overallPerformance = 88;

  // ================= Performance Summary =================

  deliveryRecords = 25;

  qualityEvaluations = 24;

  communicationRecords = 22;

  serviceRatings = 23;

  complaints = 2;

  issuesResolved = 8;

  // ================= Table =================

  displayedColumns: string[] = [
    'purchaseOrder',
    'delivery',
    'quality',
    'communication',
    'service',
    'date'
  ];

  performanceHistory = [

    {
      purchaseOrder: 'PO-1001',
      delivery: 'On-Time',
      quality: 'Excellent',
      communication: '35 Minutes',
      service: 'Excellent',
      date: '21 Jul 2026'
    },

    {
      purchaseOrder: 'PO-1002',
      delivery: 'Delayed',
      quality: 'Good',
      communication: '2 Hours',
      service: 'Good',
      date: '20 Jul 2026'
    },

    {
      purchaseOrder: 'PO-1003',
      delivery: 'Early',
      quality: 'Excellent',
      communication: '20 Minutes',
      service: 'Excellent',
      date: '18 Jul 2026'
    },

    {
      purchaseOrder: 'PO-1004',
      delivery: 'On-Time',
      quality: 'Average',
      communication: '1 Hour',
      service: 'Good',
      date: '16 Jul 2026'
    }

  ];

  dataSource = new MatTableDataSource(this.performanceHistory);

  // ================= Search =================

  applyFilter(event: Event): void {

    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

}