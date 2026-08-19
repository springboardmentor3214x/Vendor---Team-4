import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss'
})
export class OrderTracking implements OnInit {

  constructor(
    private procurementService: ProcurementService,
    private router: Router
  ) {}

  searchText = '';
  statusFilter = 'All';
  loading = true;
  orders: any[] = [];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    this.procurementService.getTrackingOrders(this.statusFilter).subscribe({
      next: (purchaseOrders) => {
        const safeOrders = Array.isArray(purchaseOrders) ? purchaseOrders : [];
        this.orders = safeOrders.map(po => this.toTrackingModel(po, po.vendor_name));

        this.procurementService.getApprovedVendors().subscribe({
          next: (vendors) => {
            const vendorMap = new Map<number, string>(vendors.map(v => [v.id, v.company_name]));
            this.orders = safeOrders.map(po => this.toTrackingModel(po, po.vendor_name || vendorMap.get(po.vendor_id)));
            this.loading = false;
          },
          error: () => {
            this.orders = safeOrders.map(po => this.toTrackingModel(po, undefined));
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.loading = false;
        alert(this.getErrorMessage(error, 'Failed to load purchase-order tracking data.'));
      }
    });
  }

  private toTrackingModel(po: any, vendorName?: string): any {
    const status = String(po.status || '').toUpperCase();
    const expected = po.expected_delivery_date ? new Date(po.expected_delivery_date) : null;
    const today = new Date();
    const delayed = !!expected && expected < today && status !== 'COMPLETED' && status !== 'CANCELLED';

    return {
      id: Number(po.id ?? po.purchase_order_id ?? 0),
      poNumber: po.po_number,
      vendor: vendorName || `Vendor #${po.vendor_id}`,
      dispatchDate: po.purchase_order_date ? new Date(po.purchase_order_date).toLocaleDateString('en-GB') : '-',
      expectedDelivery: expected ? expected.toLocaleDateString('en-GB') : '-',
      actualDelivery: status === 'COMPLETED' ? (expected ? expected.toLocaleDateString('en-GB') : '-') : '--',
      currentLocation: status === 'PENDING' ? 'Awaiting dispatch' : status === 'GENERATED' ? 'Ready for dispatch' : status === 'SENT' ? 'In transit' : status === 'COMPLETED' ? 'Delivered' : 'Cancelled',
      deliveryStatus: delayed ? 'Delayed' : this.deliveryStatus(status),
      delayStatus: delayed ? 'Delayed' : 'On Time',
      progress: this.progress(status, delayed),
      rawStatus: status
    };
  }

  get filteredOrders(): any[] {
    const search = this.searchText.trim().toLowerCase();

    return this.orders.filter(order => {
      const matchesSearch = !search ||
        String(order.poNumber || '').toLowerCase().includes(search) ||
        String(order.vendor || '').toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === 'All' || order.deliveryStatus === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  viewOrder(order: any): void {
    const id = Number(order?.id ?? order?.purchase_order_id ?? 0);

    if (!id) {
      alert('Unable to open this purchase order because its ID was not returned by the backend.');
      return;
    }

    this.router.navigate(['/purchase-order-details'], {
      queryParams: { id }
    });
  }

  private getErrorMessage(error: any, fallback: string): string {
    const detail = error?.error?.detail;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item: any) => item?.msg || item?.message)
        .filter(Boolean);

      if (messages.length) {
        return messages.join('\n');
      }
    }

    if (detail && typeof detail === 'object') {
      return detail.message || detail.msg || JSON.stringify(detail);
    }

    return fallback;
  }

  private deliveryStatus(status: string): string {
    switch (status) {
      case 'PENDING': return 'Awaiting Shipment';
      case 'GENERATED': return 'Awaiting Shipment';
      case 'SENT': return 'In Transit';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Unknown';
    }
  }

  private progress(status: string, delayed: boolean): number {
    if (delayed) return 75;
    switch (status) {
      case 'PENDING': return 10;
      case 'GENERATED': return 25;
      case 'SENT': return 60;
      case 'COMPLETED': return 100;
      case 'CANCELLED': return 0;
      default: return 0;
    }
  }
}
