import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-purchase-order-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './purchase-order-details.html',
  styleUrl: './purchase-order-details.scss'
})
export class PurchaseOrderDetails implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private procurementService: ProcurementService,
    private cdr: ChangeDetectorRef
  ) {}

  loading = true;
  purchaseOrder: any = {
    poNumber: '-', orderDate: '-', status: '-', approvedBy: '-', paymentTerms: '-',
    vendor: '-', vendorAddress: '-', contactPerson: '-', requestNumber: '-',
    department: '-', requestedBy: '-', product: '-', quantity: 0, unitPrice: 0,
    tax: '-', totalAmount: 0, shippingAddress: '-', expectedDelivery: '-',
    deliveryStatus: '-', remarks: '-'
  };

  private purchaseOrderId = 0;

  ngOnInit(): void {
    this.purchaseOrderId = Number(this.route.snapshot.queryParamMap.get('id') || 0);

    if (!this.purchaseOrderId) {
      alert('No purchase order was selected.');
      this.loading = false;
      return;
    }

    this.loadPurchaseOrder();
  }

  private loadPurchaseOrder(): void {
    this.procurementService.getPurchaseOrder(this.purchaseOrderId).subscribe({
      next: (po) => {
        // The purchase-order API already returns the related request/vendor
        // display fields. Fetch the request separately only for the fields
        // that are not part of the PO response.
        this.procurementService.getRequest(po.procurement_request_id).subscribe({
          next: (request) => this.loadVendorAndBuild(po, request),
          error: () => this.loadVendorAndBuild(po, null)
        });
      },
      error: (error) => {
        this.loading = false;
        alert(this.getErrorMessage(error, 'Failed to load purchase order.'));
      }
    });
  }

  private loadVendorAndBuild(po: any, request: any): void {
    this.procurementService.getApprovedVendors().subscribe({
      next: (vendors) => {
        const vendor = vendors.find(item => Number(item.id) === Number(po.vendor_id));
        this.buildViewModel(po, request, vendor);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.buildViewModel(po, request, null);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildViewModel(po: any, request: any, vendor: any): void {
    const status = String(po.status || '').toUpperCase();

    this.purchaseOrder = {
      poNumber: po.po_number || '-',
      orderDate: this.formatDate(po.purchase_order_date),
      status: this.displayStatus(status),
      approvedBy: po.approved_by ? String(po.approved_by) : 'Authenticated user',
      paymentTerms: po.payment_terms || '-',
      vendor: po.vendor_name || vendor?.company_name || `Vendor #${po.vendor_id}`,
      vendorAddress: vendor ? `${vendor.email || '-'}${vendor.phone ? ` | ${vendor.phone}` : ''}` : '-',
      contactPerson: vendor?.contact_person || '-',
      requestNumber: request?.request_number || `Request #${po.procurement_request_id}`,
      department: request?.department_name || po.department_name || '-',
      requestedBy: request?.requested_by ? String(request.requested_by) : '-',
      product: request?.item_name || po.item_name || '-',
      quantity: po.quantity_ordered ?? 0,
      unitPrice: po.unit_price ?? 0,
      tax: po.tax_details || '-',
      totalAmount: po.total_cost ?? 0,
      shippingAddress: po.shipping_address || '-',
      expectedDelivery: this.formatDate(po.expected_delivery_date),
      deliveryStatus: this.deliveryStatus(status),
      remarks: request?.additional_remarks || '-'
    };
  }

  printPurchaseOrder(): void {
    window.print();
  }

  downloadPdf(): void {
    // The browser print dialog provides a PDF destination without inventing a fake backend download.
    window.print();
  }

  updateStatus(): void {
    const nextStatus = this.nextStatus(this.purchaseOrder.status);

    if (!nextStatus) {
      alert('This purchase order has no further valid status transition.');
      return;
    }

    this.procurementService.updateOrderTracking(this.purchaseOrderId, nextStatus).subscribe({
      next: (response) => {
        this.purchaseOrder.status = this.displayStatus(response.status);
        this.purchaseOrder.deliveryStatus = this.deliveryStatus(response.status);
        this.cdr.detectChanges();
        alert(`Purchase order status updated to ${this.purchaseOrder.status}.`);
      },
      error: (error) => alert(this.getErrorMessage(error, 'Failed to update purchase order status.'))
    });
  }

  private nextStatus(displayStatus: string): string | null {
    switch (displayStatus) {
      case 'Pending': return 'GENERATED';
      case 'Generated': return 'SENT';
      case 'Sent': return 'COMPLETED';
      default: return null;
    }
  }

  private displayStatus(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'PENDING': return 'Pending';
      case 'GENERATED': return 'Generated';
      case 'SENT': return 'Sent';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status || '-';
    }
  }

  private deliveryStatus(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'PENDING': return 'Awaiting Shipment';
      case 'GENERATED': return 'Order Generated';
      case 'SENT': return 'In Transit';
      case 'COMPLETED': return 'Delivered / Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return '-';
    }
  }

  private getErrorMessage(error: any, fallback: string): string {
    const detail = error?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail)) return detail.map((x: any) => x?.msg || x?.message).filter(Boolean).join('\n') || fallback;
    if (detail && typeof detail === 'object') return detail.message || detail.msg || JSON.stringify(detail);
    return fallback;
  }

  private formatDate(value: string): string {
    return value ? new Date(value).toLocaleDateString('en-GB') : '-';
  }
}