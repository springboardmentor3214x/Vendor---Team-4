import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatProgressBarModule } from '@angular/material/progress-bar';

import Chart from 'chart.js/auto';
import { DashboardService } from '../../../services/dashboard.service';
import { ProcurementService } from '../../../services/procurement.service';
import { VendorPerformanceService } from '../../../services/vendor-performance.service';
import { InvoiceService } from '../../../services/invoice.service';

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    MatDatepickerModule,
    MatNativeDateModule,

    MatProgressBarModule
  ],
  templateUrl: './vendor-analytics.html',
  styleUrl: './vendor-analytics.scss'
})
export class VendorAnalytics implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private procurementService: ProcurementService,
    private performanceService: VendorPerformanceService,
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef
  ) {}

  overallPerformanceScore = 0;
  vendorReliabilityScore = 0;
  activePurchaseOrders = 0;
  completedOrders = 0;
  pendingDeliveries = 0;
  paymentStatus = '0';

  currentScore = 0;
  scoreImprovement = 0;
  scoreReduction = 0;

  deliveryAccuracy = 0;
  productQuality = 0;
  communicationEfficiency = 0;
  issueResolution = 0;
  customerSatisfaction = 0;

  activeContracts = 0;
  contractsNearExpiry = 0;
  expiredContracts = 0;
  pendingRenewals = 0;
  complianceStatus = 0;

  unreadMessages = 0;
  recentDiscussions = 0;
  uploadedDocuments = 0;
  pendingResponses = 0;
  recentNotifications = 0;

  notifications: string[] = [];

  displayedColumns = [
    'poNumber',
    'category',
    'deliveryStatus',
    'invoiceStatus',
    'transactionValue',
    'actions'
  ];

  orderHistory: any[] = [];

  dataSource = new MatTableDataSource(this.orderHistory);

  ngOnInit(): void {
    this.loadVendorAnalytics();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.initializeCharts();
  }

  loadVendorAnalytics(): void {
    this.invoiceService.getDashboard().subscribe({
      next: invoice => {
        this.paymentStatus = Number(invoice?.total_amount || 0).toLocaleString('en-IN');
        this.cdr.detectChanges();
      }, error: err => console.warn('Invoice analytics load failed:', err)
    });
    this.dashboardService.getDashboardOverview().subscribe({
      next: overview => {
        const totalPo = Number(overview?.total_purchase_orders || 0);
        this.activePurchaseOrders = Math.max(0, totalPo - Number(overview?.completed_purchase_orders || 0) - Number(overview?.cancelled_purchase_orders || 0));
        this.completedOrders = Number(overview?.completed_purchase_orders || 0);
        this.cdr.detectChanges();
      }, error: err => console.warn('Vendor overview load failed:', err)
    });
    this.dashboardService.getVendorDashboard().subscribe({
      next: data => {
        this.vendorReliabilityScore = Math.round(Number(data?.average_reliability_score || 0));
        this.overallPerformanceScore = Math.round(Number(data?.average_performance_score || 0));
        this.currentScore = this.vendorReliabilityScore;
        this.cdr.detectChanges();
      }, error: err => console.warn('Vendor analytics load failed:', err)
    });
    this.performanceService.getDashboardSummary().subscribe({
      next: performance => {
        this.deliveryAccuracy = Number(performance?.average_delivery_performance || this.deliveryAccuracy);
        this.productQuality = Math.round(Number(performance?.average_quality_rating || 0) * 20);
        this.communicationEfficiency = Number(performance?.average_vendor_score || 0);
        this.issueResolution = Number(performance?.average_vendor_score || 0);
        this.cdr.detectChanges();
      }, error: err => console.warn('Vendor performance details load failed:', err)
    });
    this.dashboardService.getDeliveryDashboard().subscribe({
      next: delivery => {
        const total = Number(delivery?.total_deliveries || 0);
        this.deliveryAccuracy = total ? Math.round((Number(delivery?.on_time_deliveries || 0) + Number(delivery?.early_deliveries || 0)) / total * 100) : 0;
        this.pendingDeliveries = Number(delivery?.delayed_deliveries || 0);
        this.cdr.detectChanges();
      }, error: err => console.warn('Delivery analytics load failed:', err)
    });
    this.dashboardService.getContractDashboard().subscribe({
      next: contracts => {
        this.activeContracts = Number(contracts?.active_contracts || 0);
        this.contractsNearExpiry = Number(contracts?.expiring_soon_contracts || 0);
        this.expiredContracts = Number(contracts?.expired_contracts || 0);
        this.pendingRenewals = Number(contracts?.expiring_soon_contracts || 0);
        this.cdr.detectChanges();
      }, error: err => console.warn('Contract analytics load failed:', err)
    });
    this.dashboardService.getCommunicationDashboard().subscribe({
      next: comm => {
        this.unreadMessages = Number(comm?.unread_messages || 0);
        this.recentDiscussions = Number(comm?.total_discussions || 0);
        this.uploadedDocuments = Number(comm?.total_shared_files || 0);
        this.pendingResponses = this.unreadMessages;
        this.cdr.detectChanges();
      }, error: err => console.warn('Communication analytics load failed:', err)
    });
    this.loadOrderHistory();
  }

  private loadOrderHistory(): void {
    this.procurementService.getPurchaseOrders({ page: 1, pageSize: 100, sortBy: 'id', sortOrder: 'desc' }).subscribe({
      next: rows => {
        const orders = Array.isArray(rows) ? rows : [];
        this.orderHistory = orders.map((o: any) => ({
          poNumber: o.po_number || `PO-${o.id}`,
          category: o.vendor_category || o.category || '—',
          deliveryStatus: String(o.status || '—').replaceAll('_', ' '),
          invoiceStatus: o.invoice_status || '—',
          transactionValue: Number(o.total_cost || o.order_value || 0)
        }));
        this.dataSource.data = this.orderHistory;
        this.cdr.detectChanges();
      },
      error: err => console.warn('Order history load failed:', err)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByContractStatus(status: string): void {
    console.log('Contract Status:', status);
  }

  filterByCategory(category: string): void {
    console.log('Category:', category);
  }

  filterByPerformance(performance: string): void {
    console.log('Performance:', performance);
  }

  refreshDashboard(): void {
    this.loadVendorAnalytics();
    alert('Vendor Analytics Refreshed');
  }

  viewOrders(): void {
    this.router.navigate(['/purchase-orders']);
  }

  viewContracts(): void {
    this.router.navigate(['/contract-repository']);
  }

  openCommunication(): void {
    this.router.navigate(['/vendor-messaging']);
  }

  viewReports(): void {
    this.router.navigate(['/reports']);
  }

  viewOrder(order?: any): void {
    if (order && order.poNumber) {
      this.router.navigate(['/purchase-orders']);
    } else {
      this.router.navigate(['/purchase-orders']);
    }
  }

  initializeCharts(): void {
    try {
      new Chart('reliabilityTrendChart', {
        type: 'line',
        data: {
          labels: ['Current'],
          datasets: [{
            label: 'Reliability Score',
            data: [this.vendorReliabilityScore]
          }]
        }
      });

      new Chart('performanceDistributionChart', {
        type: 'doughnut',
        data: {
          labels: ['Delivery', 'Quality', 'Communication', 'Issue Resolution'],
          datasets: [{
            data: [this.deliveryAccuracy, this.productQuality, this.communicationEfficiency, this.issueResolution]
          }]
        }
      });

      new Chart('categoryDistributionChart', {
        type: 'pie',
        data: {
          labels: ['Software', 'Hardware', 'Services', 'Logistics'],
          datasets: [{
            data: [this.activePurchaseOrders, this.completedOrders, this.pendingDeliveries]
          }]
        }
      });

      new Chart('contractStatusChart', {
        type: 'bar',
        data: {
          labels: ['Active', 'Expiring', 'Expired', 'Renewals'],
          datasets: [{
            label: 'Contracts',
            data: [this.activeContracts, this.contractsNearExpiry, this.expiredContracts, this.pendingRenewals]
          }]
        }
      });
    } catch (e) {
      console.warn('Chart initialization warning:', e);
    }
  }
}