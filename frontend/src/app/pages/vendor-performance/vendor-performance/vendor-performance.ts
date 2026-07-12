import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vendor-performance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './vendor-performance.html',
  styleUrl: './vendor-performance.scss'
})
export class VendorPerformance {

  totalVendors = 156;

  activeVendors = 132;

  averageRating = 4.5;

  onTimeDelivery = '94%';

  topVendors = [

    {
      company: 'ABC Technologies',
      rating: 4.9,
      delivery: '98%'
    },

    {
      company: 'XYZ Pvt Ltd',
      rating: 4.8,
      delivery: '96%'
    },

    {
      company: 'Tech Solutions',
      rating: 4.7,
      delivery: '95%'
    }

  ];

}