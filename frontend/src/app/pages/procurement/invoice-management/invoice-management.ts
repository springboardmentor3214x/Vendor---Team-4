import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './invoice-management.html',
  styleUrl: './invoice-management.scss'
})
export class InvoiceManagement implements OnInit {
  searchText = '';
  statusFilter = 'All';
  invoices: any[] = [];
  loading = false;
  actionInvoiceId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadInvoices(); }

  loadInvoices(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    this.http.get<any[]>(`${environment.apiUrl}/invoices`, {
      params: { page: 1, page_size: 100 },
      ...(headers ? { headers } : {})
    }).subscribe({
      next: data => {
        this.invoices = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.loading = false;
        this.cdr.detectChanges();
        alert(this.errorMessage(error, 'Failed to load invoices.'));
      }
    });
  }

  get filteredInvoices(): any[] {
    const q = this.searchText.trim().toLowerCase();
    return this.invoices.filter(invoice => {
      const invoiceNo = String(invoice.invoice_number || '').toLowerCase();
      const po = String(invoice.purchase_order_id || '').toLowerCase();
      const vendor = String(invoice.vendor_id || '').toLowerCase();
      const status = String(invoice.status || '').toUpperCase();
      const matchesSearch = !q || invoiceNo.includes(q) || po.includes(q) || vendor.includes(q) || `po${po}`.includes(q);
      const matchesStatus = this.statusFilter === 'All' || status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  uploadInvoice(invoice: any): void {
    const input = document.getElementById(`invoice-file-${invoice.id}`) as HTMLInputElement | null;
    input?.click();
  }

  onInvoiceFileSelected(event: Event, invoice: any): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Invoice file must be 10 MB or smaller.'); input.value = ''; return; }
    const formData = new FormData();
    formData.append('file', file);
    this.runAction(invoice.id, this.http.post<any>(`${environment.apiUrl}/invoices/${invoice.id}/upload`, formData, this.authOptions()), 'Invoice uploaded successfully.');
    input.value = '';
  }

  verifyInvoice(invoice: any): void {
    if (invoice.status === 'PAID') { alert('This invoice is already paid.'); return; }
    this.runAction(invoice.id, this.http.patch<any>(`${environment.apiUrl}/invoices/${invoice.id}/verify`, {}, this.authOptions()), 'Invoice verified successfully.');
  }

  approvePayment(invoice: any): void {
    if (invoice.status === 'PAID') { alert('This invoice is already paid.'); return; }
    if (!confirm(`Approve payment for ${invoice.invoice_number}?`)) return;
    this.runAction(invoice.id, this.http.patch<any>(`${environment.apiUrl}/invoices/${invoice.id}/mark-paid`, {}, this.authOptions()), 'Payment approved successfully.');
  }

  rejectInvoice(invoice: any): void {
    if (invoice.status === 'PAID') { alert('A paid invoice cannot be rejected.'); return; }
    if (!confirm(`Reject ${invoice.invoice_number}?`)) return;
    this.runAction(invoice.id, this.http.patch<any>(`${environment.apiUrl}/invoices/${invoice.id}/reject`, {}, this.authOptions()), 'Invoice rejected.');
  }

  viewDocument(invoice: any): void {
    if (!invoice.attachment_name) { alert('No invoice document has been uploaded yet.'); return; }
    alert(`Uploaded document: ${invoice.attachment_name}`);
  }

  viewInvoice(invoice: any): void {
    alert([
      `Invoice: ${invoice.invoice_number || '-'}`,
      `Purchase Order: PO${invoice.purchase_order_id || '-'}`,
      `Vendor ID: ${invoice.vendor_id ?? '-'}`,
      `Invoice Date: ${invoice.invoice_date || '-'}`,
      `Amount: ₹${invoice.amount ?? 0}`,
      `Status: ${invoice.status || '-'}`,
      `Document: ${invoice.attachment_name || 'Not uploaded'}`
    ].join('\n'));
  }

  private runAction(id: number, request: any, successMessage: string): void {
    this.actionInvoiceId = id;
    request.subscribe({
      next: (updated: any) => {
        const index = this.invoices.findIndex(i => Number(i.id) === Number(id));
        if (index >= 0) this.invoices[index] = { ...this.invoices[index], ...updated };
        this.actionInvoiceId = null;
        this.cdr.detectChanges();
        alert(successMessage);
      },
      error: (error: any) => {
        this.actionInvoiceId = null;
        this.cdr.detectChanges();
        alert(this.errorMessage(error, 'Invoice action failed.'));
      }
    });
  }

  private authOptions(): { headers?: { Authorization: string } } {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  private errorMessage(error: any, fallback: string): string {
    const detail = error?.error?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail)) return detail.map((x: any) => x?.msg || x?.message).filter(Boolean).join('\n') || fallback;
    if (detail && typeof detail === 'object') return detail.message || detail.msg || JSON.stringify(detail);
    return fallback;
  }
}
