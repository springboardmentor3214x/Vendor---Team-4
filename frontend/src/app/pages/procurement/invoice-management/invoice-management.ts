import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-invoice-management',
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
  templateUrl: './invoice-management.html',
  styleUrl: './invoice-management.scss'
})
export class InvoiceManagement {

  searchText = '';
  statusFilter = 'All';

  invoices = [

    {
      invoiceNo: 'INV-1001',
      poNumber: 'PO-0001',
      vendor: 'ABC Technologies',
      invoiceDate: '20-07-2026',
      invoiceAmount: '₹70,000',
      taxAmount: '₹5,000',
      totalAmount: '₹75,000',
      dueDate: '30-07-2026',
      status: 'Pending',
      document: 'invoice_INV1001.pdf'
    },

    {
      invoiceNo: 'INV-1002',
      poNumber: 'PO-0002',
      vendor: 'XYZ Suppliers',
      invoiceDate: '22-07-2026',
      invoiceAmount: '₹40,000',
      taxAmount: '₹2,500',
      totalAmount: '₹42,500',
      dueDate: '01-08-2026',
      status: 'Verified',
      document: 'invoice_INV1002.pdf'
    },

    {
      invoiceNo: 'INV-1003',
      poNumber: 'PO-0003',
      vendor: 'Global Office Solutions',
      invoiceDate: '24-07-2026',
      invoiceAmount: '₹1,15,000',
      taxAmount: '₹10,000',
      totalAmount: '₹1,25,000',
      dueDate: '05-08-2026',
      status: 'Approved',
      document: 'invoice_INV1003.pdf'
    },

    {
      invoiceNo: 'INV-1004',
      poNumber: 'PO-0004',
      vendor: 'Prime Office Equipments',
      invoiceDate: '26-07-2026',
      invoiceAmount: '₹60,000',
      taxAmount: '₹6,000',
      totalAmount: '₹66,000',
      dueDate: '08-08-2026',
      status: 'Paid',
      document: 'invoice_INV1004.pdf'
    }

  ];

  get filteredInvoices() {

    return this.invoices.filter(invoice => {

      const search =

        invoice.invoiceNo.toLowerCase().includes(this.searchText.toLowerCase()) ||

        invoice.poNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||

        invoice.vendor.toLowerCase().includes(this.searchText.toLowerCase());

      const status =

        this.statusFilter === 'All' ||

        invoice.status === this.statusFilter;

      return search && status;

    });

  }

  uploadInvoice(invoice: any) {

    console.log('Upload Invoice', invoice);

  }

  verifyInvoice(invoice: any) {

    console.log('Verify Invoice', invoice);

  }

  approvePayment(invoice: any) {

    console.log('Approve Payment', invoice);

  }

  rejectInvoice(invoice: any) {

    console.log('Reject Invoice', invoice);

  }

  viewDocument(invoice: any) {

    console.log('View Document', invoice.document);

  }

  viewInvoice(invoice: any) {

    console.log('View Invoice', invoice);

  }

}