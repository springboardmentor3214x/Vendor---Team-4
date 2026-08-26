import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
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
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { DashboardService } from '../../../services/dashboard.service';
import { VendorPerformanceService } from '../../../services/vendor-performance.service';
import { ContractComplianceService } from '../../../services/contract-compliance.service';
import { NotificationService } from '../../../services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-analytics',
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
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.scss'
})

export class AdminAnalytics
implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private performanceService: VendorPerformanceService,
    private complianceService: ContractComplianceService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  /* SYSTEM STATISTICS */
  totalUsers = 0;
  activeUsers = 0;
  totalVendors = 0;
  applicationActivity = 0;

  /* PROCUREMENT STATISTICS */
  totalProcurementRequests = 0;
  activePurchaseOrders = 0;
  completedOrders = 0;
  delayedDeliveries = 0;

  /* COMPLIANCE */
  compliantVendors = 0;
  nonCompliantVendors = 0;
  overallCompliance = 0;

  /* DATABASE HEALTH */
  databaseStatus = 'Connected';
  storageUsage: string | number = 'Not monitored';
  apiHealth: string | number = 'Operational';
  systemUptime: string | number = 'Not monitored';

  /* VENDOR ANALYTICS */
  topPerformingVendors = 0;
  vendorReliabilityAverage = 0;
  vendorGrowthRate = 0;
  vendorPerformanceIndex = 0;

  /* CONTRACTS */
  activeContracts = 0;
  expiringContracts = 0;
  expiredContracts = 0;
  pendingRenewals = 0;

  /* SYSTEM USAGE */
  dailyLogins = 0;
  monthlyUsers = 0;
  userActivityScore = 0;
  engagementRate = 0;

  /* APPLICATION ACTIVITY */
  newVendors = 0;
  newPurchaseOrders = 0;
  newContracts = 0;
  totalNotifications = 0;

  notifications: string[] = [];

  displayedColumns = [
    'activity',
    'user',
    'module',
    'date',
    'status'
  ];

  activityData: any[] = [];

  dataSource = new MatTableDataSource(this.activityData);

  ngOnInit(): void {
    this.loadAdminAnalytics();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Charts are initialized after backend data has loaded.
  }

  loadAdminAnalytics(): void {
    forkJoin({
      admin: this.dashboardService.getAdminDashboard(),
      overview: this.dashboardService.getDashboardOverview(),
      vendor: this.dashboardService.getVendorDashboard(),
      delivery: this.dashboardService.getDeliveryDashboard(),
      contracts: this.dashboardService.getContractDashboard(),
      compliance: this.complianceService.getComplianceOverview(),
      performance: this.performanceService.getDashboardSummary(),
      unread: this.notificationService.getUnreadCount()
    }).subscribe({
      next: data => {
        const admin = data.admin;
        const overview = data.overview;
        this.totalUsers = Number(admin?.total_users || 0);
        this.activeUsers = this.totalUsers;
        this.totalVendors = Number(admin?.total_vendors || 0);
        this.totalProcurementRequests = Number(admin?.total_procurement_requests || 0);
        this.activePurchaseOrders = Number(admin?.total_purchase_orders || 0);
        this.completedOrders = Number(overview?.completed_purchase_orders || 0);
        this.delayedDeliveries = Number(data.delivery?.delayed_deliveries || 0);
        const summary = data.compliance?.summary || {};
        this.compliantVendors = Number(summary.compliant_vendors || 0);
        this.nonCompliantVendors = Number(summary.non_compliant_vendors || 0);
        this.overallCompliance = Number(summary.average_compliance || 0);
        this.activeContracts = Number(data.contracts?.active_contracts || 0);
        this.expiringContracts = Number(data.contracts?.expiring_soon_contracts || 0);
        this.expiredContracts = Number(data.contracts?.expired_contracts || 0);
        this.pendingRenewals = Number(data.contracts?.expiring_soon_contracts || 0);
        this.vendorReliabilityAverage = Number(data.vendor?.average_reliability_score || 0);
        this.vendorPerformanceIndex = Number(data.vendor?.average_performance_score || 0);
        this.topPerformingVendors = Number(data.performance?.total_vendors || 0);
        this.vendorGrowthRate = Number(data.vendor?.pending_vendors || 0);
        this.applicationActivity = Number(admin?.total_activity_logs || 0);
        this.monthlyUsers = this.totalUsers;
        this.userActivityScore = Number(admin?.total_activity_logs || 0);
        this.engagementRate = this.totalUsers ? Math.min(100, Math.round(Number(admin?.total_activity_logs || 0) / this.totalUsers * 10)) : 0;
        this.newVendors = Number(data.vendor?.total_vendors || 0);
        this.newPurchaseOrders = Number(admin?.total_purchase_orders || 0);
        this.newContracts = Number(admin?.total_contracts || 0);
        this.totalNotifications = Number(data.unread?.count || 0);
        this.notifications = [];
        if (data.contracts?.expiring_soon_contracts) this.notifications.push(`${data.contracts.expiring_soon_contracts} contract(s) expire within 30 days.`);
        if (data.delivery?.delayed_deliveries) this.notifications.push(`${data.delivery.delayed_deliveries} delivery record(s) are delayed.`);
        if (data.vendor?.pending_approval_vendors) this.notifications.push(`${data.vendor.pending_approval_vendors} vendor(s) are awaiting approval.`);
        if (data.unread?.count) this.notifications.push(`${data.unread.count} unread notification(s) require attention.`);
        this.cdr.detectChanges();
        this.initializeCharts();
      },
      error: err => {
        console.error('Admin analytics load failed:', err);
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByContractStatus(status: string): void {
    console.log('Contract Status:', status);
  }

  filterByVendorPerformance(performance: string): void {
    console.log('Vendor Performance:', performance);
  }

  filterByProcurementStatus(status: string): void {
    console.log('Procurement Status:', status);
  }

  refreshDashboard(): void {
    this.loadAdminAnalytics();
    alert('Dashboard Refreshed');
  }

  manageUsers(): void {
    this.router.navigate(['/vendor-list']);
  }

  manageVendors(): void {
    this.router.navigate(['/vendor-management']);
  }

  viewReports(): void {
    this.router.navigate(['/reports']);
  }

  openNotifications(): void {
    this.router.navigate(['/communication-notifications']);
  }

  initializeCharts(): void {
    try {
      new Chart('procurementTrendChart', {
        type: 'line',
        data: {
          labels: ['Current'],
          datasets: [{
            label: 'Procurement Requests',
            data: [this.totalProcurementRequests],
            fill: false
          }]
        }
      });

      new Chart('vendorPerformanceChart', {
        type: 'pie',
        data: {
          labels: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
          datasets: [{
            data: [this.vendorReliabilityAverage, Math.max(0, 100 - this.vendorReliabilityAverage)]
          }]
        }
      });

      new Chart('procurementCategoryChart', {
        type: 'doughnut',
        data: {
          labels: ['Hardware', 'Software', 'Logistics', 'Services'],
          datasets: [{
            data: [this.totalVendors, this.activePurchaseOrders, this.activeContracts]
          }]
        }
      });

      new Chart('contractStatusChart', {
        type: 'bar',
        data: {
          labels: ['Active', 'Expiring', 'Expired', 'Renewals'],
          datasets: [{
            label: 'Contracts',
            data: [this.activeContracts, this.expiringContracts, this.expiredContracts, this.pendingRenewals]
          }]
        }
      });

      new Chart('userActivityChart', {
        type: 'line',
        data: {
          labels: ['Current'],
          datasets: [{
            label: 'User Activity',
            data: [this.applicationActivity],
            fill: true
          }]
        }
      });
    } catch (e) {
      console.warn('Chart initialization warning:', e);
    }
  }
}