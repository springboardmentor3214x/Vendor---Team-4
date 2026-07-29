import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
export class ProcurementStatus {

  searchText = '';

  statusFilter = 'All';

  procurements = [

    {
      id: 'PR-0001',
      title: 'Laptop Purchase',
      vendor: 'ABC Technologies',
      poNumber: 'PO-0001',
      status: 'Pending',
      stage: 'Waiting for Approval',
      progress: 10,
      expectedDelivery: '30-07-2026',
      lastUpdated: '18-07-2026',
      history: [
        'Request Created',
        'Submitted for Approval'
      ]
    },

    {
      id: 'PR-0002',
      title: 'Office Chairs',
      vendor: 'XYZ Suppliers',
      poNumber: 'PO-0002',
      status: 'Approved',
      stage: 'Vendor Assigned',
      progress: 35,
      expectedDelivery: '28-07-2026',
      lastUpdated: '19-07-2026',
      history: [
        'Request Created',
        'Approved',
        'Vendor Assigned'
      ]
    },

    {
      id: 'PR-0003',
      title: 'Network Switch',
      vendor: 'Global Office Solutions',
      poNumber: 'PO-0003',
      status: 'Ordered',
      stage: 'Purchase Order Sent',
      progress: 60,
      expectedDelivery: '24-07-2026',
      lastUpdated: '20-07-2026',
      history: [
        'Request Approved',
        'Vendor Assigned',
        'Purchase Order Generated'
      ]
    },

    {
      id: 'PR-0004',
      title: 'Printer Toner',
      vendor: 'Office World',
      poNumber: 'PO-0004',
      status: 'Delivered',
      stage: 'Goods Delivered',
      progress: 85,
      expectedDelivery: '20-07-2026',
      lastUpdated: '20-07-2026',
      history: [
        'Purchase Order Generated',
        'Dispatched',
        'Delivered'
      ]
    },

    {
      id: 'PR-0005',
      title: 'Projectors',
      vendor: 'Vision Electronics',
      poNumber: 'PO-0005',
      status: 'Completed',
      stage: 'Invoice Approved',
      progress: 100,
      expectedDelivery: '15-07-2026',
      lastUpdated: '21-07-2026',
      history: [
        'Delivered',
        'Invoice Uploaded',
        'Payment Approved',
        'Procurement Completed'
      ]
    },

    {
      id: 'PR-0006',
      title: 'UPS Batteries',
      vendor: '-',
      poNumber: '-',
      status: 'Cancelled',
      stage: 'Request Cancelled',
      progress: 0,
      expectedDelivery: '-',
      lastUpdated: '17-07-2026',
      history: [
        'Request Submitted',
        'Cancelled by Procurement Manager'
      ]
    }

  ];

  get total() {
    return this.procurements.length;
  }

  get pending() {
    return this.procurements.filter(
      x => x.status === 'Pending'
    ).length;
  }

  get approved() {
    return this.procurements.filter(
      x => x.status === 'Approved'
    ).length;
  }

  get ordered() {
    return this.procurements.filter(
      x => x.status === 'Ordered'
    ).length;
  }

  get delivered() {
    return this.procurements.filter(
      x => x.status === 'Delivered'
    ).length;
  }

  get completed() {
    return this.procurements.filter(
      x => x.status === 'Completed'
    ).length;
  }

  get filteredProcurements() {

    return this.procurements.filter(item => {

      const matchesSearch =

        item.id.toLowerCase().includes(this.searchText.toLowerCase()) ||

        item.title.toLowerCase().includes(this.searchText.toLowerCase()) ||

        item.vendor.toLowerCase().includes(this.searchText.toLowerCase()) ||

        item.poNumber.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus =

        this.statusFilter === 'All' ||

        item.status === this.statusFilter;

      return matchesSearch && matchesStatus;

    });

  }

  viewDetails(item: any) {

    console.log('View Details', item);

  }

  updateStatus(item: any) {

    alert('Status update functionality will be connected to the backend.');

    console.log('Update Status', item);

  }

}