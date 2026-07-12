import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface PurchaseOrder {

  poId: string;

  vendor: string;

  item: string;

  amount: string;

  orderDate: string;

  status: string;

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

export class PurchaseOrders {

  constructor(private router: Router) {}

  displayedColumns = [
    'poId',
    'vendor',
    'item',
    'amount',
    'orderDate',
    'status',
    'actions'
  ];

  searchText = '';

  selectedStatus = '';

  purchaseOrders: PurchaseOrder[] = [

    {
      poId: 'PO001',
      vendor: 'ABC Technologies',
      item: 'Laptop',
      amount: '₹4,50,000',
      orderDate: '10 Jul 2026',
      status: 'Approved'
    },

    {
      poId: 'PO002',
      vendor: 'XYZ Pvt Ltd',
      item: 'Office Chairs',
      amount: '₹1,20,000',
      orderDate: '12 Jul 2026',
      status: 'Pending'
    },

    {
      poId: 'PO003',
      vendor: 'Tech Solutions',
      item: 'Network Switch',
      amount: '₹80,000',
      orderDate: '14 Jul 2026',
      status: 'Completed'
    }

  ];

  get filteredOrders() {

    return this.purchaseOrders.filter(order => {

      const search =

        order.poId
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||

        order.vendor
          .toLowerCase()
          .includes(this.searchText.toLowerCase());

      const status =

        !this.selectedStatus ||

        order.status === this.selectedStatus;

      return search && status;

    });

  }

  createPurchaseOrder() {

    console.log('Create Purchase Order');

  }

  viewOrder(id: string) {

    console.log('View', id);

  }

  editOrder(id: string) {

    console.log('Edit', id);

  }

}