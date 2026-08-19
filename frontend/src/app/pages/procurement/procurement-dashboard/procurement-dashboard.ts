import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-procurement-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './procurement-dashboard.html',
  styleUrl: './procurement-dashboard.scss'
})
export class ProcurementDashboard implements OnInit {

  constructor(
    private router: Router,
    private procurementService: ProcurementService,
    private cdr: ChangeDetectorRef
  ) {}

  totalRequests = 0;
  pending = 0;
  approved = 0;
  purchaseOrders = 0;
  delivered = 0;
  completed = 0;
  cancelled = 0;

  recentActivities: any[] = [];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    // Load the dashboard endpoint when available. We also load the actual
    // request/PO lists below so the cards cannot remain at zero when the
    // aggregate endpoint is unavailable or stale.
    this.procurementService.getDashboard().subscribe({
      next: (data) => {
        if (data) {
          this.totalRequests = Number(data.total_requests ?? this.totalRequests);
          this.pending = Number(data.pending_requests ?? this.pending);
          this.approved = Number(data.approved_requests ?? this.approved);
          this.completed = Number(data.completed_requests ?? this.completed);
          this.cancelled = Number(data.cancelled_requests ?? this.cancelled);
          this.cdr.detectChanges();
        }
      },
      error: (error) => console.warn('Procurement dashboard aggregate unavailable; deriving values from records.', error)
    });

    // Source of truth for request counts.
    this.procurementService.getRequests({ page: 1, size: 1000 }).subscribe({
      next: (response) => {
        const requests = Array.isArray(response?.items) ? response.items : [];
        const status = (value: any) => String(value ?? '').toUpperCase();

        this.totalRequests = Number(response?.total ?? requests.length);
        this.pending = requests.filter((r: any) => status(r.request_status) === 'PENDING').length;
        this.approved = requests.filter((r: any) => status(r.request_status) === 'APPROVED').length;
        this.completed = requests.filter((r: any) => status(r.request_status) === 'COMPLETED').length;
        this.cancelled = requests.filter((r: any) => status(r.request_status) === 'CANCELLED').length;

        this.recentActivities = requests.slice(0, 6).map((item: any) => ({
          id: item.request_number,
          title: item.request_title || item.item_name || item.request_number,
          vendor: item.vendor_id ? `Vendor #${item.vendor_id}` : 'Not Assigned',
          status: item.request_status,
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-GB')
            : '-'
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load procurement requests:', this.getErrorMessage(error, 'Failed to load procurement requests.'));
        this.cdr.detectChanges();
      }
    });

    // Source of truth for PO/delivery counts.
    this.procurementService.getPurchaseOrders({ page: 1, pageSize: 100 }).subscribe({
      next: (purchaseOrders) => {
        const orders = Array.isArray(purchaseOrders) ? purchaseOrders : [];
        const status = (value: any) => String(value ?? '').toUpperCase();

        this.purchaseOrders = orders.length;
        this.delivered = orders.filter((po: any) => status(po.status) === 'COMPLETED').length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load purchase orders:', this.getErrorMessage(error, 'Failed to load purchase orders.'));
        this.cdr.detectChanges();
      }
    });
  }

  procurementList(): void {
    this.router.navigate(['/procurement-request-list']);
  }

  addProcurement(): void {
    this.router.navigate(['/procurement-request']);
  }

  purchaseOrdersPage(): void {
    this.router.navigate(['/purchase-orders']);
  }

  orderTracking(): void {
    this.router.navigate(['/order-tracking']);
  }

  private getErrorMessage(error: any, fallback: string): string {
    const detail = error?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail)) return detail.map((x: any) => x?.msg || x?.message).filter(Boolean).join('\n') || fallback;
    if (detail && typeof detail === 'object') return detail.message || detail.msg || JSON.stringify(detail);
    return fallback;
  }

  invoiceManagement(): void {
    this.router.navigate(['/invoice-management']);
  }

  vendorAssignment(): void {
    this.router.navigate(['/vendor-assignment']);
  }
}
