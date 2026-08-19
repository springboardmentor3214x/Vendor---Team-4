import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-delivery-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatTableModule, MatIconModule, MatSelectModule],
  templateUrl: './delivery-performance.html',
  styleUrl: './delivery-performance.scss'
})
export class DeliveryPerformance implements OnInit {
  constructor(private fb: FormBuilder, private router: Router, private service: ProcurementService, private cdr: ChangeDetectorRef) {}

  deliveryForm!: FormGroup;
  purchaseOrders: any[] = [];
  selectedOrder: any = null;
  purchaseOrderNumber = '-';
  vendorName = '-';
  expectedDeliveryDate = '-';
  purchaseOrderStatus = '-';
  displayedColumns = ['purchaseOrder', 'vendor', 'expectedDate', 'actualDate', 'delay', 'status', 'remarks'];
  deliveryHistory: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  ngOnInit(): void {
    this.deliveryForm = this.fb.group({
      purchaseOrderId: ['', Validators.required],
      actualDeliveryDate: ['', Validators.required],
      delay: [{ value: '0 Days', disabled: true }],
      deliveryStatus: [{ value: 'On-Time Delivery', disabled: true }],
      remarks: ['']
    });
    this.deliveryForm.get('purchaseOrderId')?.valueChanges.subscribe(id => this.selectOrder(Number(id)));
    this.deliveryForm.get('actualDeliveryDate')?.valueChanges.subscribe(date => this.calculateDelay(date));
    this.loadOrders();
    this.loadHistory();
  }

  loadHistory(): void {
    this.service.getDeliveryRecords().subscribe({
      next: (rows: any[]) => {
        this.deliveryHistory = (Array.isArray(rows) ? rows : []).map((r: any) => ({
          purchaseOrder: `PO #${r.purchase_order_id}`,
          vendor: `Vendor #${r.vendor_id}`,
          expectedDate: this.formatDate(r.expected_delivery_date),
          actualDate: this.formatDate(r.actual_delivery_date),
          delay: r.delay_days ?? 0,
          status: r.delivery_status ?? '-',
          remarks: r.remarks || '-'
        }));
        this.dataSource.data = this.deliveryHistory;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load delivery history:', error)
    });
  }

  loadOrders(): void {
    this.service.getPurchaseOrders({ page: 1, pageSize: 100 }).subscribe({
      next: (orders: any[]) => {
        const all = Array.isArray(orders) ? orders : [];
        this.purchaseOrders = all.filter(o => ['COMPLETED', 'DELIVERED', 'SENT', 'GENERATED'].includes(String(o.status ?? '').toUpperCase()));
        if (this.purchaseOrders[0]) {
          this.deliveryForm.patchValue({ purchaseOrderId: this.purchaseOrders[0].id }, { emitEvent: true });
        }
        this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load purchase orders:', error)
    });
  }

  selectOrder(id: number): void {
    this.selectedOrder = this.purchaseOrders.find(o => Number(o.id) === id) || null;
    if (!this.selectedOrder) {
      this.purchaseOrderNumber = '-'; this.vendorName = '-'; this.expectedDeliveryDate = '-'; this.purchaseOrderStatus = '-';
      return;
    }
    this.purchaseOrderNumber = this.selectedOrder.po_number ?? `PO #${this.selectedOrder.id}`;
    this.expectedDeliveryDate = this.formatDate(this.selectedOrder.expected_delivery_date);
    this.purchaseOrderStatus = this.selectedOrder.status ?? '-';
    const vendorId = Number(this.selectedOrder.vendor_id ?? 0);
    if (!vendorId) { this.vendorName = '-'; return; }
    this.service.getApprovedVendors().subscribe({
      next: (vendors: any[]) => {
        const vendor = (Array.isArray(vendors) ? vendors : []).find(v => Number(v.id) === vendorId);
        this.vendorName = vendor?.company_name ?? vendor?.name ?? `Vendor #${vendorId}`;
        this.cdr.detectChanges();
      },
      error: () => { this.vendorName = `Vendor #${vendorId}`; this.cdr.detectChanges(); }
    });
  }

  calculateDelay(value: any): void {
    if (!value || !this.selectedOrder?.expected_delivery_date) return;
    const expected = new Date(this.selectedOrder.expected_delivery_date);
    const actual = new Date(value);
    const days = Math.round((actual.getTime() - expected.getTime()) / 86400000);
    this.deliveryForm.patchValue({
      delay: `${Math.max(0, days)} Days`,
      deliveryStatus: days > 0 ? 'Delayed Delivery' : days < 0 ? 'Early Delivery' : 'On-Time Delivery'
    }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.deliveryForm.invalid || !this.selectedOrder) return;
    const raw = this.deliveryForm.getRawValue();
    this.service.recordDelivery({
      purchase_order_id: Number(raw.purchaseOrderId),
      actual_delivery_date: this.toDate(raw.actualDeliveryDate),
      remarks: raw.remarks || null
    }).subscribe({
      next: () => { alert('Delivery performance saved successfully.'); this.resetForm(); this.loadOrders(); this.loadHistory(); },
      error: (error: unknown) => alert(this.errorMessage(error, 'Failed to save delivery performance.'))
    });
  }

  resetForm(): void {
    this.deliveryForm.reset({ purchaseOrderId: this.purchaseOrders[0]?.id || '', delay: '0 Days', deliveryStatus: 'On-Time Delivery', remarks: '' });
  }

  applyFilter(event: Event): void { this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase(); }
  goBack(): void { this.router.navigate(['/vendor-performance-dashboard']); }
  private formatDate(value: string | null | undefined): string { return value ? new Date(value).toLocaleDateString('en-GB') : '-'; }
  private toDate(value: any): string { return new Date(value).toISOString().slice(0, 10); }
  private errorMessage(error: any, fallback: string): string { const d = error?.error?.detail; return typeof d === 'string' ? d : fallback; }
}
