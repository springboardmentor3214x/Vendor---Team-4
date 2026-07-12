import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class Analytics {


  totalVendors = 0;

  totalProcurements = 0;

  purchaseOrders = 0;

  vendorReliability = '--';



  recentAnalytics = [

    {
      title: 'Vendor Reliability',
      value: '96%'
    },

    {
      title: 'Procurement Growth',
      value: '+8%'
    }

  ];

}