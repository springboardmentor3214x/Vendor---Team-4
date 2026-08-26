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
  selector: 'app-procurement-status',
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
  templateUrl: './procurement-status.html',
  styleUrl: './procurement-status.scss'
})
export class ProcurementStatus implements OnInit {

  constructor(
    private procurementService: ProcurementService,
    private router: Router
  ) {}

  searchText = '';
  statusFilter = 'All';
  loading = true;
  procurements: any[] = [];

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.loading = true;
    this.procurementService.getProcurementStatus().subscribe({
      next: (items) => {
        this.procurements = items.map(item => this.toViewModel(item));
        this.loadPurchaseOrdersForDetails();
      },
      error: (error) => {
        this.loading = false;
        alert(error?.error?.detail || 'Failed to load procurement status.');
      }
    });
  }

  private loadPurchaseOrdersForDetails(): void {
    this.procurementService.getPurchaseOrders({ page: 1, pageSize: 1000 }).subscribe({
      next: (orders) => {
        const byRequest = new Map<number, any>(orders.map(order => [order.procurement_request_id, order]));

        this.procurements = this.procurements.map(item => {
          const po = byRequest.get(item.requestBackendId);
          return {
            ...item,
            poId: po?.id || null,
            poNumber: po?.po_number || '-',
            expectedDelivery: po?.expected_delivery_date
              ? new Date(po.expected_delivery_date).toLocaleDateString('en-GB')
              : item.expectedDelivery,
            status: this.statusFromWorkflow(item.requestStatus, po?.status)
          };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private toViewModel(item: any): any {
    return {
      requestBackendId: item.procurement_request_id,
      id: item.procurement_request_number,
      title: item.item_name,
      vendor: item.vendor_name || 'Not Assigned',
      poId: null,
      poNumber: '-',
      requestStatus: item.request_status,
      status: this.statusFromWorkflow(item.request_status, null),
      stage: item.workflow_stage,
      progress: this.progress(item.request_status, item.workflow_stage),
      expectedDelivery: '-',
      lastUpdated: '-',
      history: [item.workflow_stage]
    };
  }

  get total(): number { return this.procurements.length; }
  get pending(): number { return this.procurements.filter(x => x.status === 'Pending').length; }
  get approved(): number { return this.procurements.filter(x => x.status === 'Approved').length; }
  get ordered(): number { return this.procurements.filter(x => x.status === 'Ordered').length; }
  get delivered(): number { return this.procurements.filter(x => x.status === 'Delivered').length; }
  get completed(): number { return this.procurements.filter(x => x.status === 'Completed').length; }

  get filteredProcurements(): any[] {
    const search = this.searchText.trim().toLowerCase();
    return this.procurements.filter(item => {
      const matchesSearch = !search ||
        item.id.toLowerCase().includes(search) ||
        item.title.toLowerCase().includes(search) ||
        item.vendor.toLowerCase().includes(search) ||
        item.poNumber.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === 'All' || item.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  viewDetails(item: any): void {
    if (item.poId) {
      this.router.navigate(['/purchase-order-details'], { queryParams: { id: item.poId } });
      return;
    }
    this.router.navigate(['/procurement-request/view', item.requestBackendId]);
  }

  updateStatus(item: any): void {
    if (!item.poId) {
      alert('A purchase order has not been created for this procurement request yet.');
      return;
    }

    const next = this.nextStatus(item.status);
    if (!next) {
      alert('No further status transition is available.');
      return;
    }

    this.procurementService.updateOrderTracking(item.poId, next).subscribe({
      next: () => {
        alert('Purchase order status updated successfully.');
        this.loadStatus();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to update status.')
    });
  }

  private statusFromWorkflow(requestStatus: string, poStatus: string | null): string {
    if (poStatus) {
      switch (String(poStatus).toUpperCase()) {
        case 'PENDING': return 'Approved';
        case 'GENERATED': return 'Ordered';
        case 'SENT': return 'Delivered';
        case 'COMPLETED': return 'Completed';
        case 'CANCELLED': return 'Cancelled';
      }
    }
    return requestStatus || 'Pending';
  }

  private progress(requestStatus: string, stage: string): number {
    if (requestStatus === 'Rejected' || requestStatus === 'Cancelled') return 0;
    if (stage === 'Purchase Order Created') return 60;
    if (stage === 'Vendor Assigned') return 35;
    if (requestStatus === 'Approved') return 25;
    if (requestStatus === 'Completed') return 100;
    return 10;
  }

  private nextStatus(status: string): string | null {
    switch (status) {
      case 'Approved': return 'GENERATED';
      case 'Ordered': return 'SENT';
      case 'Delivered': return 'COMPLETED';
      default: return null;
    }
  }
}
