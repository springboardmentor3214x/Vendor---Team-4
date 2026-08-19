import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProcurementService } from '../../../services/procurement.service';

interface PurchaseOrder {
  id: number;
  poId: string;
  vendor: string;
  vendorId: number;
  item: string;
  amount: string;
  orderDate: string;
  status: string;
  rawStatus: string;
  procurementRequestId: number;
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './purchase-orders.html',
  styleUrl: './purchase-orders.scss'
})
export class PurchaseOrders implements OnInit {

  constructor(
    private router: Router,
    private procurementService: ProcurementService,
    private cdr: ChangeDetectorRef
  ) {}

  displayedColumns = ['poId', 'vendor', 'item', 'amount', 'orderDate', 'status', 'actions'];
  searchText = '';
  selectedStatus = '';
  loading = true;
  purchaseOrders: PurchaseOrder[] = [];

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.loading = true;

    this.procurementService.getPurchaseOrders({ page: 1, pageSize: 100 }).subscribe({
      next: (orders) => {
        const safeOrders = Array.isArray(orders) ? orders : [];
        // Purchase orders must remain visible even if the optional vendor-name lookup fails.
        this.mapOrders(safeOrders, new Map<number, string>());

        this.procurementService.getApprovedVendors().subscribe({
          next: (vendors) => {
            this.mapOrders(safeOrders, new Map<number, string>(vendors.map(v => [v.id, v.company_name])));
          },
          error: (error) => {
            console.warn('Vendor lookup failed; showing purchase orders with vendor IDs.', this.getErrorMessage(error, 'Vendor lookup failed.'));
          }
        });
      },
      error: (error) => {
        this.loading = false;
        alert(this.getErrorMessage(error, 'Failed to load purchase orders.'));
        this.cdr.detectChanges();
      }
    });
  }

  get filteredOrders(): PurchaseOrder[] {
    const search = this.searchText.trim().toLowerCase();

    return this.purchaseOrders.filter(order => {
      const matchesSearch = !search ||
        order.poId.toLowerCase().includes(search) ||
        order.vendor.toLowerCase().includes(search) ||
        order.item.toLowerCase().includes(search);

      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  get totalOrders(): number { return this.purchaseOrders.length; }
  get pendingOrders(): number { return this.purchaseOrders.filter(o => o.rawStatus === 'PENDING').length; }
  get completedOrders(): number { return this.purchaseOrders.filter(o => o.rawStatus === 'COMPLETED').length; }
  get cancelledOrders(): number { return this.purchaseOrders.filter(o => o.rawStatus === 'CANCELLED').length; }

  createPurchaseOrder(): void {
    this.router.navigate(['/purchase-order-creation']);
  }

  viewOrder(id: string): void {
    const order = this.purchaseOrders.find(item => item.poId === id);
    if (!order) return;

    this.router.navigate(['/purchase-order-details'], {
      queryParams: { id: order.id }
    });
  }

  editOrder(id: string): void {
    const order = this.purchaseOrders.find(item => item.poId === id);
    if (!order || order.rawStatus === 'CANCELLED' || order.rawStatus === 'COMPLETED') return;

    this.router.navigate(['/purchase-order-creation'], {
      queryParams: { id: order.id }
    });
  }


  private mapOrders(orders: any[], vendorMap: Map<number, string>): void {
    this.purchaseOrders = orders.map(order => ({
      id: order.id,
      poId: String(order.po_number || `PO-${order.id}`),
      vendorId: order.vendor_id,
      vendor: order.vendor_name || vendorMap.get(order.vendor_id) || `Vendor #${order.vendor_id}`, 
      item: `Procurement Request #${order.procurement_request_id}`,
      amount: `₹${Number(order.total_cost ?? 0).toLocaleString('en-IN')}`,
      orderDate: order.purchase_order_date ? new Date(order.purchase_order_date).toLocaleDateString('en-GB') : '-',
      status: this.displayStatus(order.status),
      rawStatus: String(order.status || '').toUpperCase(),
      procurementRequestId: order.procurement_request_id
    }));
    this.loading = false;
    this.cdr.detectChanges();
  }

  private getErrorMessage(error: any, fallback: string): string {
    const detail = error?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail)) return detail.map((x: any) => x?.msg || x?.message).filter(Boolean).join('\n') || fallback;
    if (detail && typeof detail === 'object') return detail.message || detail.msg || JSON.stringify(detail);
    return fallback;
  }

  private displayStatus(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'PENDING': return 'Pending';
      case 'GENERATED': return 'Generated';
      case 'SENT': return 'Sent';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status || 'Unknown';
    }
  }
}