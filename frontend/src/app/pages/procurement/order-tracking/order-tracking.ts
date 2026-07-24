import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-order-tracking',
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
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss'
})
export class OrderTracking {

  searchText = '';
  statusFilter = 'All';

  orders = [

    {
      poNumber: 'PO-0001',
      vendor: 'ABC Technologies',

      dispatchDate: '20-07-2026',
      expectedDelivery: '28-07-2026',
      actualDelivery: '--',

      currentLocation: 'Kolkata Distribution Center',

      deliveryStatus: 'Awaiting Shipment',
      delayStatus: 'On Time',

      progress: 10
    },

    {
      poNumber: 'PO-0002',
      vendor: 'XYZ Suppliers',

      dispatchDate: '18-07-2026',
      expectedDelivery: '26-07-2026',
      actualDelivery: '--',

      currentLocation: 'Mumbai Logistics Hub',

      deliveryStatus: 'In Transit',
      delayStatus: 'On Time',

      progress: 60
    },

    {
      poNumber: 'PO-0003',
      vendor: 'Global Office Solutions',

      dispatchDate: '15-07-2026',
      expectedDelivery: '22-07-2026',
      actualDelivery: '22-07-2026',

      currentLocation: 'Company Warehouse',

      deliveryStatus: 'Delivered',
      delayStatus: 'On Time',

      progress: 100
    },

    {
      poNumber: 'PO-0004',
      vendor: 'Prime Office Equipments',

      dispatchDate: '12-07-2026',
      expectedDelivery: '18-07-2026',
      actualDelivery: '--',

      currentLocation: 'Transport Delay - Chennai',

      deliveryStatus: 'Delayed',
      delayStatus: 'Delayed',

      progress: 80
    },

    {
      poNumber: 'PO-0005',
      vendor: 'NextGen Supplies',

      dispatchDate: '08-07-2026',
      expectedDelivery: '14-07-2026',
      actualDelivery: '13-07-2026',

      currentLocation: 'Successfully Delivered',

      deliveryStatus: 'Completed',
      delayStatus: 'On Time',

      progress: 100
    }

  ];

  get filteredOrders() {

    return this.orders.filter(order => {

      const search =

        order.poNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||

        order.vendor.toLowerCase().includes(this.searchText.toLowerCase());

      const status =

        this.statusFilter === 'All' ||

        order.deliveryStatus === this.statusFilter;

      return search && status;

    });

  }

  viewOrder(order: any) {

    console.log('View Order Details', order);

  }

}