import {
  Component,
  ViewChild,
  AfterViewInit,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';

import Chart from 'chart.js/auto';
import { DashboardService } from '../../../services/dashboard.service';
import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-dashboard-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    MatDatepickerModule,
    MatNativeDateModule,

    MatChipsModule
  ],
  templateUrl: './dashboard-analytics.html',
  styleUrl: './dashboard-analytics.scss'
})
export class DashboardAnalytics implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(private dashboardService: DashboardService, private procurementService: ProcurementService) {}

  // =========================
  // Procurement Statistics
  // =========================

  totalProcurementRequests = 120;
  pendingApprovals = 35;
  activePurchaseOrders = 125;
  completedOrders = 84;
  cancelledOrders = 11;

  // =========================
  // Procurement Overview
  // =========================

  todayRequests = 14;
  weeklyCompletedOrders = 28;
  monthlySpending = '8.5 Crore';
  yearlyGrowth = 18;

  // =========================
  // Delivery Dashboard
  // =========================

  onTimeDeliveries = 92;
  delayedDeliveries = 15;
  deliveredOrders = 180;
  pendingShipments = 21;
  completedDeliveries = 310;

  // =========================
  // Purchase Orders Table
  // =========================

  displayedColumns: string[] = [
    'poNumber',
    'vendorName',
    'category',
    'status',
    'deliveryDate',
    'manager',
    'actions'
  ];

  purchaseOrders: any[] = [];
  /* purchase orders are loaded from the backend */
  /*
    {
      poNumber: 'PO-1001',
      vendorName: 'ABC Technologies',
      category: 'Hardware',
      status: 'Active',
      deliveryDate: '15 Aug 2026',
      manager: 'John Smith'
    },
    {
      poNumber: 'PO-1002',
      vendorName: 'Global Logistics',
      category: 'Logistics',
      status: 'Delayed',
      deliveryDate: '10 Aug 2026',
      manager: 'Sarah Wilson'
    },
    {
      poNumber: 'PO-1003',
      vendorName: 'Tech Solutions',
      category: 'Software',
      status: 'Pending',
      deliveryDate: '22 Aug 2026',
      manager: 'David Clark'
    },
    {
      poNumber: 'PO-1004',
      vendorName: 'Industrial Corp',
      category: 'Manufacturing',
      status: 'Deadline Near',
      deliveryDate: '05 Aug 2026',
      manager: 'Michael Brown'
    },
    {
      poNumber: 'PO-1005',
      vendorName: 'Smart Systems',
      category: 'Software',
      status: 'Completed',
      deliveryDate: '30 Aug 2026',
      manager: 'Emma Wilson'
    }
  ];

  */
  dataSource = new MatTableDataSource(this.purchaseOrders);
  selectedOrder: any = null;

  topVendors = [
    {
      name: 'ABC Technologies',
      rating: 9.4,
      deliveryAccuracy: 97,
      productQuality: 95,
      communicationEfficiency: 96,
      issueResolution: 94,
      averageServiceRating: 4.8
    },
    {
      name: 'Global Logistics',
      rating: 8.9,
      deliveryAccuracy: 92,
      productQuality: 90,
      communicationEfficiency: 91,
      issueResolution: 89,
      averageServiceRating: 4.5
    },
    {
      name: 'Industrial Corp',
      rating: 8.7,
      deliveryAccuracy: 89,
      productQuality: 93,
      communicationEfficiency: 88,
      issueResolution: 90,
      averageServiceRating: 4.4
    }
  ];

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.initializeCharts();
  }

  loadAnalytics(): void {
    this.dashboardService.getProcurementDashboard().subscribe({
      next: (data) => {
        if (data) {
          this.totalProcurementRequests = data.total_requests ?? 0;
          this.pendingApprovals = data.pending_requests ?? 0;
          this.completedOrders = data.completed_requests ?? 0;
          this.cancelledOrders = data.cancelled_requests ?? 0;
        }
      },
      error: (err) => {
        console.warn('Dashboard analytics metrics fallback:', err);
      }
    });

    this.procurementService.getPurchaseOrders({ page: 1, pageSize: 100 }).subscribe({
      next: orders => {
        this.purchaseOrders = (orders || []).map((o: any) => ({
          poNumber: o.po_number, vendorName: o.vendor_name || `Vendor #${o.vendor_id}`,
          category: o.product_category || '—', status: o.status,
          deliveryDate: o.expected_delivery_date || '—', manager: '—'
        }));
        this.dataSource.data = this.purchaseOrders;
      },
      error: err => console.error('Failed to load dashboard purchase orders:', err)
    });

    this.dashboardService.getDeliveryDashboard().subscribe({
      next: (delivery) => {
        if (delivery) {
          this.onTimeDeliveries = delivery.on_time_deliveries ?? 0;
          this.delayedDeliveries = delivery.delayed_deliveries ?? 0;
          this.deliveredOrders = delivery.total_deliveries ?? 0;
        }
      },
      error: () => {}
    });
  }

  initializeCharts(): void {
    try {
      new Chart('procurementVolumeChart', {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Procurement Volume',
            data: [40, 55, 60, 80, 75, 95]
          }]
        }
      });

      new Chart('departmentChart', {
        type: 'pie',
        data: {
          labels: ['IT', 'Finance', 'Operations', 'HR'],
          datasets: [{
            data: [35, 25, 30, 10]
          }]
        }
      });

      new Chart('categoryChart', {
        type: 'doughnut',
        data: {
          labels: ['Hardware', 'Software', 'Logistics', 'Manufacturing'],
          datasets: [{
            data: [30, 40, 15, 15]
          }]
        }
      });

      new Chart('expenseChart', {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Expenses (Lakhs)',
            data: [20, 25, 30, 45, 40, 55],
            fill: false
          }]
        }
      });

      new Chart('departmentExpenseChart', {
        type: 'bar',
        data: {
          labels: ['IT', 'Finance', 'Operations', 'HR'],
          datasets: [{
            label: 'Department Spending',
            data: [120, 80, 150, 50]
          }]
        }
      });

      new Chart('vendorExpenseChart', {
        type: 'pie',
        data: {
          labels: ['ABC Technologies', 'Global Logistics', 'Industrial Corp', 'Smart Systems'],
          datasets: [{
            data: [35, 25, 20, 20]
          }]
        }
      });

      new Chart('categoryExpenseChart', {
        type: 'doughnut',
        data: {
          labels: ['Hardware', 'Software', 'Logistics', 'Manufacturing'],
          datasets: [{
            data: [40, 30, 20, 10]
          }]
        }
      });

      new Chart('projectExpenseChart', {
        type: 'bar',
        data: {
          labels: ['Project A', 'Project B', 'Project C', 'Project D'],
          datasets: [{
            label: 'Project Expenses',
            data: [100, 150, 90, 70]
          }]
        }
      });
    } catch (e) {
      console.warn('Chart initialization warning:', e);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  filterByDepartment(department: string): void {
    console.log('Department:', department);
  }

  filterByStatus(status: string): void {
    console.log('Status:', status);
  }

  filterByVendorCategory(category: string): void {
    console.log('Vendor Category:', category);
  }

  refreshDashboard(): void {
    this.loadAnalytics();
    alert('Dashboard Analytics Refreshed');
  }

  viewOrder(order: any): void {
    console.log('Viewing Order:', order);
  }

  selectOrder(order: any): void {
    this.selectedOrder = order;
  }
}