import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-purchase-order-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './purchase-order-details.html',
  styleUrl: './purchase-order-details.scss'
})
export class PurchaseOrderDetails {

  purchaseOrder = {

    // Purchase Order Information

    poNumber: 'PO-0001',

    orderDate: '21-07-2026',

    status: 'Approved',

    approvedBy: 'John Smith',

    paymentTerms: 'Net 30',

    // Vendor Information

    vendor: 'ABC Technologies',

    vendorAddress: '12 Park Street, Kolkata, West Bengal',

    contactPerson: 'Rahul Sharma',

    // Procurement Request Information

    requestNumber: 'PR-0001',

    department: 'Information Technology',

    requestedBy: 'Sagnik Pati',

    // Ordered Product

    product: 'Dell Latitude 5440 Laptop',

    quantity: 10,

    unitPrice: 65000,

    tax: '18% GST',

    totalAmount: 767000,

    // Delivery Information

    shippingAddress:
      'IT Department, Main Office, Kolkata',

    expectedDelivery: '30-07-2026',

    deliveryStatus: 'Awaiting Shipment',

    // Remarks

    remarks:
      'Urgent purchase approved for new employee onboarding.'

  };

  printPurchaseOrder() {

    window.print();

  }

  downloadPdf() {

    alert('PDF download functionality will be connected to the backend.');

    console.log('Download PDF');

  }

  updateStatus() {

    alert('Update Status functionality will be connected to the backend.');

    console.log('Update Status');

  }

}