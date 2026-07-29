import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-vendor-ranking',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './vendor-ranking.html',
  styleUrl: './vendor-ranking.scss'
})
export class VendorRanking {

  // ================= Summary =================

  totalVendors = 12;

  topVendor = 'ABC Suppliers';

  averagePerformance = 89;

  lastUpdated = '22 Jul 2026';

  // ================= Table Columns =================

  displayedColumns: string[] = [
    'rank',
    'vendor',
    'category',
    'overall',
    'delivery',
    'quality',
    'communication',
    'service'
  ];

  // ================= Dummy Ranking Data =================

  vendorRankings = [

    {
      rank: 1,
      vendor: 'ABC Suppliers',
      category: 'Electronics',
      overall: 97,
      delivery: 96,
      quality: 98,
      communication: 95,
      service: 97
    },

    {
      rank: 2,
      vendor: 'Global Traders',
      category: 'Office Supplies',
      overall: 93,
      delivery: 94,
      quality: 92,
      communication: 91,
      service: 94
    },

    {
      rank: 3,
      vendor: 'Prime Industries',
      category: 'Machinery',
      overall: 90,
      delivery: 89,
      quality: 91,
      communication: 90,
      service: 90
    },

    {
      rank: 4,
      vendor: 'Vision Technologies',
      category: 'IT Equipment',
      overall: 87,
      delivery: 86,
      quality: 88,
      communication: 87,
      service: 86
    },

    {
      rank: 5,
      vendor: 'Delta Logistics',
      category: 'Transportation',
      overall: 84,
      delivery: 82,
      quality: 85,
      communication: 84,
      service: 85
    }

  ];

  dataSource = new MatTableDataSource(this.vendorRankings);

  // ================= Search =================

  applyFilter(event: Event): void {

    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

}