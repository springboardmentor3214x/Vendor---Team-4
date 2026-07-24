import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-performance-trend-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './performance-trend-analysis.html',
  styleUrl: './performance-trend-analysis.scss'
})
export class PerformanceTrendAnalysis implements AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;

  // ================= Summary Cards =================

  averageReliability = 89;

  improvingVendors = 10;

  decliningVendors = 3;

  stableVendors = 5;

  // ================= Filters =================

  searchText = '';

  selectedCategory = '';

  categories: string[] = [
    'Electronics',
    'Office Supplies',
    'Machinery',
    'IT Equipment',
    'Transportation'
  ];

  // ================= Table Columns =================

  displayedColumns: string[] = [
    'vendor',
    'category',
    'monthly',
    'yearly',
    'trend',
    'details'
  ];

  // ================= Dummy Data =================

  trends = [

    {
      vendor: 'ABC Suppliers',
      category: 'Electronics',
      monthly: 96,
      yearly: 94,
      trend: 'Improving'
    },

    {
      vendor: 'Global Traders',
      category: 'Office Supplies',
      monthly: 91,
      yearly: 90,
      trend: 'Stable'
    },

    {
      vendor: 'Vision Technologies',
      category: 'IT Equipment',
      monthly: 88,
      yearly: 84,
      trend: 'Improving'
    },

    {
      vendor: 'Prime Industries',
      category: 'Machinery',
      monthly: 80,
      yearly: 83,
      trend: 'Declining'
    },

    {
      vendor: 'Delta Logistics',
      category: 'Transportation',
      monthly: 68,
      yearly: 72,
      trend: 'Declining'
    }

  ];

  dataSource = new MatTableDataSource(this.trends);

  constructor() {

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {

      const filters = JSON.parse(filter);

      const searchMatch =
        data.vendor.toLowerCase().includes(filters.search) ||
        data.category.toLowerCase().includes(filters.search);

      const categoryMatch =
        !filters.category ||
        data.category === filters.category;

      return searchMatch && categoryMatch;

    };

  }

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort;

  }

  // ================= Search & Filters =================

  applyFilters(): void {

    this.dataSource.filter = JSON.stringify({

      search: this.searchText.trim().toLowerCase(),

      category: this.selectedCategory

    });

  }

}