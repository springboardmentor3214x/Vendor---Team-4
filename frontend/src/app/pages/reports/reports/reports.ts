import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../../services/report.service';
import { VendorService } from '../../../services/vendor.service';
import { NotificationService } from '../../../services/notification.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class Reports implements OnInit {

  /* =========================================================
     TOP BAR
     ========================================================= */

  showSearch = false;
  showNotifications = false;
  searchText = '';

  unreadNotifications = 4;

  recentNotifications: any[] = [];


  /* =========================================================
     REPORT TYPES
     ========================================================= */

  reportTypes = [
    {
      value: 'vendor-performance',
      title: 'Vendor Performance',
      icon: 'business',
      description:
        'Analyze vendor delivery, quality, communication, issue resolution and reliability.'
    },
    {
      value: 'procurement',
      title: 'Procurement Report',
      icon: 'shopping_cart',
      description:
        'Review procurement requests, approvals, purchase orders and expenditure.'
    },
    {
      value: 'purchase-orders',
      title: 'Purchase Orders',
      icon: 'receipt_long',
      description:
        'View purchase order transactions, delivery dates, values and invoice status.'
    },
    {
      value: 'compliance',
      title: 'Compliance Report',
      icon: 'verified_user',
      description:
        'Monitor certifications, missing documents, expiry and compliance percentage.'
    },
    {
      value: 'contracts',
      title: 'Contract Report',
      icon: 'description',
      description:
        'Review contracts, values, expiry dates, renewal status and compliance.'
    },
    {
      value: 'executive-summary',
      title: 'Executive Summary',
      icon: 'insights',
      description:
        'Get high-level business insights across vendors, procurement and compliance.'
    }
  ];

  selectedReportType = 'vendor-performance';


  /* =========================================================
     FILTERS
     ========================================================= */

  startDate: Date | null = null;
  endDate: Date | null = null;

  selectedVendorCategory = 'All';
  selectedDepartment = 'All';
  selectedVendor = 'All';
  selectedProcurementStatus = 'All';
  selectedPurchaseOrderStatus = 'All';
  selectedContractStatus = 'All';
  selectedContractExpiry = 'All';
  selectedComplianceStatus = 'All';
  selectedReliabilityScore = 'All';


  vendorCategories = [
    'Raw Material Suppliers',
    'Equipment Vendors',
    'IT Vendors',
    'Service Providers',
    'Logistics Partners',
    'Maintenance Vendors'
  ];

  departments = [
    'Production', 'Procurement', 'Finance', 'IT',
    'Operations', 'Human Resources', 'Supply Chain'
  ];

  vendors: string[] = [];

  procurementStatuses = [
    'Submitted',
    'Pending Approval',
    'Approved',
    'Rejected',
    'Completed'
  ];

  purchaseOrderStatuses = [
    'Active',
    'Completed',
    'Delayed',
    'Cancelled'
  ];

  contractStatuses = [
    'Active',
    'Expired',
    'Expiring Soon',
    'Renewal Pending',
    'Terminated'
  ];

  contractExpiryPeriods = [
    'Within 30 Days',
    'Within 60 Days',
    'Within 90 Days',
    'More Than 90 Days',
    'Already Expired'
  ];

  complianceStatuses = [
    'Compliant',
    'Pending',
    'Expired',
    'Non-Compliant'
  ];

  reliabilityScores = [
    '90 - 100 Excellent',
    '80 - 89 Good',
    '70 - 79 Average',
    'Below 70 Needs Improvement'
  ];


  /* =========================================================
     REPORT STATE
     ========================================================= */

  reportGenerated = false;

  generatedDate = new Date();

  selectedReportTitle = 'Vendor Performance Report';

  selectedDateRange = 'All Dates';


  /* =========================================================
     REPORT SUMMARY
     ========================================================= */

  reportSummary = {
    totalRecords: 0,
    totalValue: '₹0',
    completionRate: 0,
    averageReliability: 0
  };


  /* =========================================================
     CHART DATA
     ========================================================= */

  monthlyTrend: { month: string; value: number; percentage: number }[] = [];


  /* =========================================================
     REPORT TABLE COLUMNS
     ========================================================= */

  vendorColumns = [
    'vendor',
    'category',
    'orders',
    'delayedDeliveries',
    'delivery',
    'quality',
    'communicationResponse',
    'issueResolution',
    'serviceRating',
    'reliability'
  ];

  procurementColumns = [
    'department',
    'requests',
    'approved',
    'orders',
    'spending'
  ];

  purchaseOrderColumns = [
    'poNumber',
    'vendor',
    'category',
    'orderDate',
    'deliveryDate',
    'value',
    'status',
    'invoice',
    'completionDate'
  ];

  complianceColumns = [
    'vendor',
    'certification',
    'verificationDate',
    'expiryDate',
    'status',
    'missingDocuments',
    'pendingActivities',
    'compliance'
  ];

  contractColumns = [
    'contractNumber',
    'vendor',
    'value',
    'startDate',
    'endDate',
    'renewal',
    'contractType',
    'manager',
    'complianceStatus'
  ];

  executiveColumns = [
    'metric',
    'value',
    'change',
    'insight'
  ];


  /* =========================================================
     REPORT DATA
     ========================================================= */

  reportRows: any[] = [];


  /* =========================================================
     CONSTRUCTOR
     ========================================================= */

  constructor(
    private router: Router,
    private reportService: ReportService,
    private vendorService: VendorService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}


  /* =========================================================
     INIT
     ========================================================= */

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadFilterOptions();
    this.loadUnreadNotifications();
    this.selectReportType('vendor-performance');
  }

  private loadFilterOptions(): void {
    this.vendorService.getVendors({ page: 1, size: 1000 }).subscribe({
      next: response => {
        const items = Array.isArray(response?.items) ? response.items : [];
        this.vendors = items.map(v => v.company_name).filter(Boolean);
        const categories = items.map(v => v.vendor_category).filter(Boolean);
        this.vendorCategories = [...new Set([...this.vendorCategories, ...categories])].sort();
        this.cdr.detectChanges();
      },
      error: err => console.warn('Unable to load report vendor filters:', err)
    });
  }

  private loadUnreadNotifications(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: result => { this.unreadNotifications = Number(result?.count || 0); this.cdr.detectChanges(); },
      error: err => console.warn('Unable to load report notification count:', err)
    });
    this.notificationService.getStoredNotifications().subscribe({
      next: rows => {
        this.recentNotifications = (Array.isArray(rows) ? rows : []).slice(0, 5).map(n => ({
          title: n.title,
          description: n.description,
          time: n.created_at ? new Date(n.created_at).toLocaleString() : 'Recently',
          icon: 'notifications'
        }));
        this.cdr.detectChanges();
      },
      error: err => console.warn('Unable to load report notifications:', err)
    });
  }


  /* =========================================================
     DEFAULT DATE RANGE
     ========================================================= */

  private setDefaultDates(): void {

    const today = new Date();

    const sixMonthsAgo = new Date();

    sixMonthsAgo.setMonth(
      today.getMonth() - 6
    );

    this.startDate = sixMonthsAgo;
    this.endDate = today;

    this.updateDateRange();
  }


  /* =========================================================
     REPORT TYPE
     ========================================================= */

  selectReportType(type: string): void {

    this.selectedReportType = type;

    const selected = this.reportTypes.find(
      report => report.value === type
    );

    this.selectedReportTitle =
      selected?.title || 'Report';

    this.generateReport();
  }


  /* =========================================================
     DATE RANGE
     ========================================================= */

  private updateDateRange(): void {

    if (!this.startDate && !this.endDate) {
      this.selectedDateRange = 'All Dates';
      return;
    }

    if (this.startDate && this.endDate) {

      const start = this.formatDate(this.startDate);
      const end = this.formatDate(this.endDate);

      this.selectedDateRange =
        `${start} - ${end}`;

      return;
    }

    if (this.startDate) {
      this.selectedDateRange =
        `From ${this.formatDate(this.startDate)}`;
      return;
    }

    if (this.endDate) {
      this.selectedDateRange =
        `Until ${this.formatDate(this.endDate)}`;
    }
  }


  /* =========================================================
     FILTER CLEAR
     ========================================================= */

  clearFilters(): void {
    this.startDate = null;
    this.endDate = null;

    this.selectedVendorCategory = 'All';
    this.selectedDepartment = 'All';
    this.selectedVendor = 'All';
    this.selectedProcurementStatus = 'All';
    this.selectedPurchaseOrderStatus = 'All';
    this.selectedContractStatus = 'All';
    this.selectedContractExpiry = 'All';
    this.selectedComplianceStatus = 'All';
    this.selectedReliabilityScore = 'All';

    this.selectedDateRange = 'All Dates';

    this.generateReport();
    alert('All report filters have been cleared successfully!');
  }


  /* =========================================================
     GENERATE REPORT
     ========================================================= */

  generateReport(): void {
    this.updateDateRange();
    this.reportGenerated = true;
    this.generatedDate = new Date();

    const params = this.getReportParams();
    let request: any;
    switch (this.selectedReportType) {
      case 'vendor-performance': request = this.reportService.getVendorPerformanceReport(params); break;
      case 'procurement': request = this.reportService.getProcurementReport(params); break;
      case 'purchase-orders': request = this.reportService.getPurchaseOrderReport(params); break;
      case 'compliance': request = this.reportService.getComplianceReport(params); break;
      case 'contracts': request = this.reportService.getContractReport(params); break;
      case 'executive-summary': request = this.reportService.getExecutiveSummaryReport(params); break;
      default: this.reportRows = []; this.updateReportSummary(); return;
    }

    request.subscribe({
      next: (data: any) => {
        this.applyBackendReport(data);
        if (this.selectedReportType === 'executive-summary') {
          const trends = data?.monthly_procurement_trends || {};
          const entries = Object.entries(trends).sort(([a], [b]) => a.localeCompare(b));
          const max = Math.max(1, ...entries.map(([, value]: any) => Number(value?.orders || 0)));
          this.monthlyTrend = entries.map(([month, value]: any) => ({ month, value: Number(value?.orders || 0), percentage: Math.round(Number(value?.orders || 0) / max * 100) }));
        } else {
          this.monthlyTrend = [];
        }
        this.reportGenerated = true;
        this.updateReportSummary();
        this.cdr.detectChanges();
        this.scrollToReportPreview();
      },
      error: (err: any) => {
        console.error('Report API failed:', err);
        this.reportRows = [];
        this.reportGenerated = true;
        this.updateReportSummary();
        this.scrollToReportPreview();
      }
    });
  }

  private applyBackendReport(data: any): void {
    const rows = Array.isArray(data?.vendors) ? data.vendors :
      Array.isArray(data?.purchase_orders) ? data.purchase_orders :
      Array.isArray(data?.contracts) ? data.contracts :
      Array.isArray(data?.compliance) ? data.compliance : [];

    if (this.selectedReportType === 'vendor-performance') {
      this.reportRows = rows.map((r: any) => ({
        vendor: r.vendor_name, category: r.vendor_category, orders: r.total_purchase_orders_completed ?? r.total_purchase_orders ?? 0,
        delivery: Number(r.on_time_delivery_percentage ?? 0), quality: Number(r.quality_rating ?? 0) * 20,
        reliability: Number(r.vendor_reliability_score ?? 0), delayedDeliveries: r.delayed_deliveries ?? 0,
        communicationResponse: `${Number(r.communication_response_time ?? 0)} min`,
        issueResolution: Number(r.issue_resolution_performance ?? 0), serviceRating: Number(r.overall_service_rating ?? 0)
      }));
    } else if (this.selectedReportType === 'procurement') {
      const dept = data?.department_wise_requests || {};
      this.reportRows = Object.entries(dept).map(([department, value]: any) => ({
        department,
        requests: Number(value?.requests || 0),
        approved: Number(value?.approved || 0),
        orders: Number(value?.orders || 0),
        spending: this.formatCurrency(value?.spending || 0)
      }));
      if (!this.reportRows.length) {
        this.reportRows = [{
          department: 'All Departments',
          requests: Number(data?.total_procurement_requests || 0),
          approved: Number(data?.approved_requests || 0),
          orders: Number(data?.total_purchase_orders || 0),
          spending: this.formatCurrency(data?.total_expenditure || 0)
        }];
      }
    } else if (this.selectedReportType === 'purchase-orders') {
      this.reportRows = rows.map((r: any) => ({
        poNumber: r.po_number, vendor: r.vendor_name || '—', category: r.vendor_category || '—',
        orderDate: this.formatReportDate(r.purchase_date), deliveryDate: this.formatReportDate(r.expected_delivery_date),
        value: this.formatCurrency(r.order_value ?? 0), status: this.displayReportStatus(r.status), invoice: r.invoice_status || '—'
      }));
    } else if (this.selectedReportType === 'compliance') {
      this.reportRows = rows.map((r: any) => ({
        vendor: r.vendor_name, certification: r.certification_status || '—', verificationDate: '—', expiryDate: '—',
        status: r.overall_status || '—', missingDocuments: r.document_status === 'Pending' ? 1 : 0, pendingActivities: r.overall_status === 'Pending' ? 1 : 0, compliance: Number(r.compliance_percentage ?? 0)
      }));
    } else if (this.selectedReportType === 'contracts') {
      this.reportRows = rows.map((r: any) => ({
        contractNumber: r.contract_number, vendor: r.vendor_name || '—', value: this.formatCurrency(r.contract_value ?? 0),
        startDate: this.formatReportDate(r.start_date), endDate: this.formatReportDate(r.end_date), renewal: r.status || '—',
        contractType: r.contract_type || '—', manager: r.contract_manager || '—', complianceStatus: r.status || '—'
      }));
    } else {
      this.reportRows = Array.isArray(data?.metrics) ? data.metrics.map((r: any) => ({
        metric: r.metric || r.name || 'Metric', value: r.value ?? '—', change: r.change ?? '—', insight: r.insight ?? '—'
      })) : [];
    }
  }

  private formatReportDate(value: any): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-GB');
  }

  private formatCurrency(value: any): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
  }

  private displayReportStatus(status: any): string {
    return String(status || '—').replaceAll('_', ' ');
  }

  private scrollToReportPreview(): void {
    setTimeout(() => {
      const element =
        document.querySelector('.report-preview') ||
        document.querySelector('.preview-card');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }


  /* =========================================================
     REPORT SUMMARY
     ========================================================= */

  private updateReportSummary(): void {

    const totalRecords =
      this.reportRows.length;

    let totalValue = 0;

    if (
      this.selectedReportType === 'purchase-orders'
    ) {

      totalValue =
        this.reportRows.reduce(
          (total, row) =>
            total + this.parseCurrency(row.value),
          0
        );
    }

    if (
      this.selectedReportType === 'procurement'
    ) {

      totalValue =
        this.reportRows.reduce(
          (total, row) =>
            total + this.parseCurrency(row.spending),
          0
        );
    }

    if (
      this.selectedReportType === 'contracts'
    ) {

      totalValue =
        this.reportRows.reduce(
          (total, row) =>
            total + this.parseCurrency(row.value),
          0
        );
    }

    let completionRate = 0;
    let averageReliability = 0;

    if (
      this.selectedReportType === 'vendor-performance'
      && this.reportRows.length > 0
    ) {

      averageReliability =
        Math.round(
          this.reportRows.reduce(
            (sum, row) =>
              sum + Number(row.reliability),
            0
          ) / this.reportRows.length
        );

      completionRate =
        Math.round(
          this.reportRows.reduce(
            (sum, row) =>
              sum + Number(row.delivery),
            0
          ) / this.reportRows.length
        );
    }

    if (
      this.selectedReportType === 'compliance'
      && this.reportRows.length > 0
    ) {

      averageReliability =
        Math.round(
          this.reportRows.reduce(
            (sum, row) =>
              sum + Number(row.compliance),
            0
          ) / this.reportRows.length
        );

      completionRate = averageReliability;
    }

    this.reportSummary = {
      totalRecords,
      totalValue:
        totalValue > 0
          ? this.formatIndianCurrency(totalValue)
          : this.getDefaultReportValue(),

      completionRate,
      averageReliability
    };
  }


  private getDefaultReportValue(): string {
    return '₹0';
  }


  /* =========================================================
     RELIABILITY FILTER
     ========================================================= */

  private matchesReliabilityScore(
    score: number
  ): boolean {

    if (this.selectedReliabilityScore === 'All') {
      return true;
    }

    if (
      this.selectedReliabilityScore
        .startsWith('90')
    ) {
      return score >= 90;
    }

    if (
      this.selectedReliabilityScore
        .startsWith('80')
    ) {
      return score >= 80 && score <= 89;
    }

    if (
      this.selectedReliabilityScore
        .startsWith('70')
    ) {
      return score >= 70 && score <= 79;
    }

    if (
      this.selectedReliabilityScore
        .startsWith('Below')
    ) {
      return score < 70;
    }

    return true;
  }


  /* =========================================================
     CONTRACT STATUS FILTER
     ========================================================= */

  private matchesContractStatus(
    endDate: string
  ): boolean {

    if (this.selectedContractStatus === 'All') {
      return true;
    }

    const days =
      this.getDaysUntilDate(endDate);

    switch (this.selectedContractStatus) {

      case 'Active':
        return days > 90;

      case 'Expiring Soon':
        return days >= 0 && days <= 90;

      case 'Expired':
        return days < 0;

      case 'Renewal Pending':
        return days >= 0 && days <= 30;

      case 'Terminated':
        return false;

      default:
        return true;
    }
  }


  /* =========================================================
     CONTRACT EXPIRY FILTER
     ========================================================= */

  private matchesContractExpiry(
    endDate: string
  ): boolean {

    const days =
      this.getDaysUntilDate(endDate);

    switch (this.selectedContractExpiry) {

      case 'Within 30 Days':
        return days >= 0 && days <= 30;

      case 'Within 60 Days':
        return days >= 0 && days <= 60;

      case 'Within 90 Days':
        return days >= 0 && days <= 90;

      case 'More Than 90 Days':
        return days > 90;

      case 'Already Expired':
        return days < 0;

      default:
        return true;
    }
  }


  /* =========================================================
     DATE HELPERS
     ========================================================= */

  private getDaysUntilDate(
    dateString: string
  ): number {

    const target =
      new Date(dateString);

    if (isNaN(target.getTime())) {
      return 999;
    }

    const today =
      new Date();

    today.setHours(0, 0, 0, 0);

    target.setHours(0, 0, 0, 0);

    const difference =
      target.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    );
  }


  private formatDate(
    date: Date
  ): string {

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  /* =========================================================
     CURRENCY
     ========================================================= */

  private parseCurrency(
    value: string
  ): number {

    if (!value) {
      return 0;
    }

    const clean =
      value
        .replace(/₹/g, '')
        .replace(/,/g, '')
        .trim();

    const number =
      parseFloat(clean);

    if (isNaN(number)) {
      return 0;
    }

    if (clean.includes('Cr')) {
      return number * 10000000;
    }

    if (clean.includes('L')) {
      return number * 100000;
    }

    return number;
  }


  private formatIndianCurrency(
    value: number
  ): string {

    if (value >= 10000000) {

      return `₹${(
        value / 10000000
      ).toFixed(1)} Cr`;
    }

    if (value >= 100000) {

      return `₹${(
        value / 100000
      ).toFixed(1)} L`;
    }

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }
    ).format(value);
  }


  /* =========================================================
     SEARCH
     ========================================================= */

  toggleSearch(): void {
    this.showSearch =
      !this.showSearch;

    if (!this.showSearch) {
      this.searchText = '';
    }
  }


  /* =========================================================
     NOTIFICATIONS
     ========================================================= */

  toggleNotifications(): void {

    this.showNotifications =
      !this.showNotifications;
  }


  /* =========================================================
     PRINT / PDF
     ========================================================= */

  printReport(): void {

    this.generateReport();

    setTimeout(() => {
      window.print();
    }, 100);
  }


  private getReportParams(): any {
    const params: any = {};
    if (this.selectedVendor !== 'All') params.vendor_name = this.selectedVendor;
    if (this.startDate) params.start_date = this.startDate.toISOString().split('T')[0];
    if (this.endDate) params.end_date = this.endDate.toISOString().split('T')[0];

    if (this.selectedReportType === 'vendor-performance') {
      if (this.selectedVendorCategory !== 'All') params.vendor_category = this.selectedVendorCategory;
    } else if (this.selectedReportType === 'procurement') {
      if (this.selectedDepartment !== 'All') params.department_name = this.selectedDepartment;
    } else if (this.selectedReportType === 'purchase-orders') {
      if (this.selectedVendorCategory !== 'All') params.category = this.selectedVendorCategory;
      if (this.selectedDepartment !== 'All') params.department_name = this.selectedDepartment;
      if (this.selectedPurchaseOrderStatus !== 'All') params.status = this.selectedPurchaseOrderStatus;
    } else if (this.selectedReportType === 'compliance') {
      if (this.selectedVendorCategory !== 'All') params.vendor_category = this.selectedVendorCategory;
      if (this.selectedComplianceStatus !== 'All') params.compliance_status = this.selectedComplianceStatus;
    } else if (this.selectedReportType === 'contracts') {
      if (this.selectedContractStatus !== 'All') params.status = this.selectedContractStatus;
      const expiryMap: Record<string, number> = { 'Within 30 Days': 30, 'Within 60 Days': 60, 'Within 90 Days': 90 };
      if (expiryMap[this.selectedContractExpiry]) params.expiring_within_days = expiryMap[this.selectedContractExpiry];
    }
    return params;
  }

  exportPDF(): void {
    const params = this.getReportParams();
    this.reportService.getReportPdf(this.selectedReportType, params).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.getSafeFileName(this.selectedReportTitle)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.warn('Backend PDF download error, falling back to browser print:', err);
        window.print();
      }
    });
  }

  /* =========================================================
     EXCEL EXPORT
     ========================================================= */

  exportExcel(): void {
    if (!this.reportGenerated || !this.reportRows.length) {
      this.generateReport();
    }
    const params = this.getReportParams();
    this.reportService.getReportExcel(this.selectedReportType, params).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.getSafeFileName(this.selectedReportTitle)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`Excel report "${this.selectedReportTitle}" downloaded successfully!`);
      },
      error: (err) => {
        console.warn('Backend Excel download error, falling back to local HTML table export:', err);
        this.fallbackExportExcel();
      }
    });
  }

  fallbackExportExcel(): void {
    if (!this.reportRows.length) {
      alert('There is no report data available to export.');
      return;
    }

    const headers =
      this.getExcelHeaders();

    const rows =
      this.getExcelRows();

    let table =
      '<table border="1">';

    table += '<thead><tr>';

    headers.forEach(
      header => {
        table +=
          `<th>${this.escapeHtml(header)}</th>`;
      }
    );

    table += '</tr></thead>';

    table += '<tbody>';

    rows.forEach(row => {

      table += '<tr>';

      row.forEach(cell => {

        table +=
          `<td>${this.escapeHtml(
            String(cell ?? '')
          )}</td>`;
      });

      table += '</tr>';
    });

    table += '</tbody></table>';

    const html =
      `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }

            th, td {
              border: 1px solid #999;
              padding: 8px;
            }

            th {
              font-weight: bold;
            }
          </style>
        </head>

        <body>

          <h2>
            Vendor Reliability Intelligence Platform
          </h2>

          <h3>
            ${this.escapeHtml(
              this.selectedReportTitle
            )}
          </h3>

          <p>
            Generated:
            ${this.formatDate(
              this.generatedDate
            )}
          </p>

          ${table}

        </body>
      </html>
      `;

    const blob =
      new Blob(
        [html],
        {
          type:
            'application/vnd.ms-excel'
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `${this.getSafeFileName(
        this.selectedReportTitle
      )}.xls`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }


  /* =========================================================
     EXCEL HEADERS
     ========================================================= */

  private getExcelHeaders(): string[] {

    switch (this.selectedReportType) {

      case 'vendor-performance':
        return [
          'Vendor Name',
          'Category',
          'Completed Orders',
          'Delayed Deliveries',
          'On-Time Delivery %',
          'Quality %',
          'Communication Response',
          'Issue Resolution %',
          'Overall Service Rating %',
          'Reliability %'
        ];

      case 'procurement':
        return [
          'Department',
          'Requests',
          'Approved',
          'Purchase Orders',
          'Expenditure'
        ];

      case 'purchase-orders':
        return [
          'PO Number',
          'Vendor',
          'Category',
          'Purchase Date',
          'Delivery Date',
          'Order Value',
          'Status',
          'Invoice Status',
          'Completion Date'
        ];

      case 'compliance':
        return [
          'Vendor',
          'Certification',
          'Verification Date',
          'Expiry Date',
          'Status',
          'Missing Documents',
          'Pending Activities',
          'Compliance %'
        ];

      case 'contracts':
        return [
          'Contract Number',
          'Vendor',
          'Contract Value',
          'Start Date',
          'End Date',
          'Renewal Status',
          'Contract Type',
          'Contract Manager',
          'Compliance Status'
        ];

      case 'executive-summary':
        return [
          'Business Metric',
          'Current Value',
          'Change',
          'Management Insight'
        ];

      default:
        return [];
    }
  }


  /* =========================================================
     EXCEL ROWS
     ========================================================= */

  private getExcelRows(): any[][] {

    return this.reportRows.map(
      row => {

        switch (this.selectedReportType) {

          case 'vendor-performance':
            return [
              row.vendor,
              row.category,
              row.orders,
              row.delayedDeliveries,
              `${row.delivery}%`,
              `${row.quality}%`,
              row.communicationResponse,
              `${row.issueResolution}%`,
              `${row.serviceRating}%`,
              `${row.reliability}%`
            ];

          case 'procurement':
            return [
              row.department,
              row.requests,
              row.approved,
              row.orders,
              row.spending
            ];

          case 'purchase-orders':
            return [
              row.poNumber,
              row.vendor,
              row.category,
              row.orderDate,
              row.deliveryDate,
              row.value,
              row.status,
              row.invoice,
              row.completionDate
            ];

          case 'compliance':
            return [
              row.vendor,
              row.certification,
              row.verificationDate,
              row.expiryDate,
              row.status,
              row.missingDocuments,
              row.pendingActivities,
              `${row.compliance}%`
            ];

          case 'contracts':
            return [
              row.contractNumber,
              row.vendor,
              row.value,
              row.startDate,
              row.endDate,
              row.renewal,
              row.contractType,
              row.manager,
              row.complianceStatus
            ];

          case 'executive-summary':
            return [
              row.metric,
              row.value,
              row.change,
              row.insight
            ];

          default:
            return [];
        }
      }
    );
  }


  /* =========================================================
     HTML ESCAPE
     ========================================================= */

  private escapeHtml(
    value: string
  ): string {

    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  /* =========================================================
     FILE NAME
     ========================================================= */

  private getSafeFileName(
    name: string
  ): string {

    return name
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }


  /* =========================================================
     NAVIGATION
     ========================================================= */

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToVendorManagement(): void {
    this.router.navigate(['/vendor-management']);
  }

  goToProcurement(): void {
    this.router.navigate(['/procurement']);
  }

  goToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }


  /* =========================================================
     LOGOUT
     ========================================================= */

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}