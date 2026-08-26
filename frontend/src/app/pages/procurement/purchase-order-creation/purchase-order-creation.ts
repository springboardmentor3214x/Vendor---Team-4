import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-purchase-order-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './purchase-order-creation.html',
  styleUrl: './purchase-order-creation.scss'
})
export class PurchaseOrderCreation implements OnInit {

  purchaseOrderForm: any;
  procurementRequests: string[] = [];
  vendors: string[] = [];
  requestRecords: any[] = [];
  vendorRecords: any[] = [];

  editingId: number | null = null;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private procurementService: ProcurementService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.purchaseOrderForm = this.fb.group({
      purchaseOrderNumber: [{ value: '', disabled: true }],
      procurementRequest: ['', Validators.required],
      vendor: [{ value: '', disabled: true }, Validators.required],
      vendorAddress: [{ value: '', disabled: true }, Validators.required],
      contactPerson: [{ value: '', disabled: true }, Validators.required],
      productDetails: [{ value: '', disabled: true }, Validators.required],
      quantity: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      totalCost: [{ value: '', disabled: true }, Validators.required],
      taxDetails: [''],
      shippingAddress: ['', Validators.required],
      expectedDelivery: ['', Validators.required],
      paymentTerms: ['', Validators.required],
      status: [{ value: 'PENDING', disabled: true }, Validators.required],
      approvedBy: [{ value: 'Current authenticated user', disabled: true }],
      orderDate: [new Date(), Validators.required],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadReferenceData();
  }

  private loadReferenceData(): void {
    this.loading = true;

    this.procurementService.getRequests({ page: 1, size: 1000 }).subscribe({
      next: (response) => {
        this.requestRecords = (response?.items || [])
          .filter((item: any) => item.request_status === 'Approved' && item.vendor_id)
          .filter((item: any) => !this.editingId || true);
        this.procurementRequests = this.requestRecords.map(item => item.request_number);
        this.loadVendors();
      },
      error: (error) => {
        this.loading = false;
        alert(this.getErrorMessage(error, 'Failed to load approved procurement requests.'));
      }
    });

    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.editingId = id;
    }
  }

  private loadVendors(): void {
    this.procurementService.getApprovedVendors().subscribe({
      next: (vendors) => {
        this.vendorRecords = vendors;
        this.vendors = vendors.map(vendor => vendor.company_name);
        this.loading = false;

        if (this.editingId) {
          this.loadExistingPurchaseOrder(this.editingId);
        } else {
          const requestNumber = this.route.snapshot.queryParamMap.get('request');
          if (requestNumber) {
            this.selectRequest(requestNumber);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        alert(this.getErrorMessage(error, 'Failed to load approved vendors.'));
      }
    });
  }

  selectRequest(requestNumber: string): void {
    const request = this.requestRecords.find(item => item.request_number === requestNumber);
    if (!request) return;

    const vendor = this.vendorRecords.find(item => item.id === request.vendor_id);

    this.purchaseOrderForm.patchValue({
      procurementRequest: request.request_number,
      vendor: vendor?.company_name || `Vendor #${request.vendor_id}`,
      vendorAddress: vendor ? `${vendor.email || ''}${vendor.phone ? ` | ${vendor.phone}` : ''}` : '',
      contactPerson: vendor?.contact_person || '',
      productDetails: request.item_name,
      quantity: request.quantity,
      expectedDelivery: request.required_delivery_date,
      totalCost: this.calculateTotal()
    });

    this.updateTotalCost();
  }

  private loadExistingPurchaseOrder(id: number): void {
    this.procurementService.getPurchaseOrder(id).subscribe({
      next: (po) => {
        const request = this.requestRecords.find(item => item.id === po.procurement_request_id);
        const vendor = this.vendorRecords.find(item => item.id === po.vendor_id);

        this.purchaseOrderForm.patchValue({
          purchaseOrderNumber: po.po_number,
          procurementRequest: request?.request_number || '',
          vendor: vendor?.company_name || `Vendor #${po.vendor_id}`,
          vendorAddress: vendor ? `${vendor.email || ''}${vendor.phone ? ` | ${vendor.phone}` : ''}` : '',
          contactPerson: vendor?.contact_person || '',
          productDetails: request?.item_name || '',
          quantity: po.quantity_ordered,
          unitPrice: po.unit_price,
          totalCost: po.total_cost,
          taxDetails: po.tax_details || '',
          shippingAddress: po.shipping_address || '',
          expectedDelivery: po.expected_delivery_date,
          paymentTerms: po.payment_terms || '',
          status: po.status,
          orderDate: po.purchase_order_date
        });
      },
      error: (error) => alert(this.getErrorMessage(error, 'Failed to load purchase order.'))
    });
  }

  calculateTotal(): number {
    const quantity = Number(this.purchaseOrderForm.get('quantity')?.value || 0);
    const unitPrice = Number(this.purchaseOrderForm.get('unitPrice')?.value || 0);
    return quantity * unitPrice;
  }

  updateTotalCost(): void {
    this.purchaseOrderForm.patchValue({
      totalCost: this.calculateTotal()
    }, { emitEvent: false });
  }

  createPurchaseOrder(): void {
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();
      return;
    }

    const form = this.purchaseOrderForm.getRawValue();
    const request = this.requestRecords.find(item => item.request_number === form.procurementRequest);

    if (!request) {
      alert('Select an approved procurement request with an assigned vendor.');
      return;
    }

    const payload = {
      procurement_request_id: request.id,
      purchase_order_date: this.toDate(form.orderDate),
      expected_delivery_date: this.toDate(form.expectedDelivery),
      unit_price: Number(form.unitPrice),
      tax_details: form.taxDetails || null,
      shipping_address: form.shippingAddress || null,
      payment_terms: form.paymentTerms || null
    };

    this.loading = true;

    if (this.editingId) {
      const updatePayload = {
        expected_delivery_date: payload.expected_delivery_date,
        unit_price: payload.unit_price,
        tax_details: payload.tax_details,
        shipping_address: payload.shipping_address,
        payment_terms: payload.payment_terms
      };

      this.procurementService.updatePurchaseOrder(this.editingId, updatePayload).subscribe({
        next: () => {
          this.loading = false;
          alert('Purchase Order updated successfully.');
          this.router.navigate(['/purchase-order-details'], {
            queryParams: { id: this.editingId }
          });
        },
        error: (error) => {
          this.loading = false;
          alert(this.getErrorMessage(error, 'Failed to update purchase order.'));
        }
      });
      return;
    }

    this.procurementService.createPurchaseOrder(payload).subscribe({
      next: (response) => {
        this.loading = false;
        alert(`Purchase Order ${response.po_number} generated successfully.`);
        this.router.navigate(['/purchase-order-details'], {
          queryParams: { id: response.id }
        });
      },
      error: (error) => {
        this.loading = false;
        alert(this.getErrorMessage(error, 'Failed to generate purchase order.'));
      }
    });
  }

  savePurchaseOrder(): void {
    this.createPurchaseOrder();
  }

  cancelPurchaseOrder(): void {
    if (this.editingId) {
      this.router.navigate(['/purchase-orders']);
      return;
    }

    this.router.navigate(['/purchase-orders']);
  }

  private getErrorMessage(error: any, fallback: string): string {
    const detail = error?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail)) return detail.map((x: any) => x?.msg || x?.message).filter(Boolean).join('\n') || fallback;
    if (detail && typeof detail === 'object') return detail.message || detail.msg || JSON.stringify(detail);
    return fallback;
  }

  private toDate(value: any): string {
    return new Date(value).toISOString().split('T')[0];
  }
}
