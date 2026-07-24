import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-supplier-ranking',
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
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './supplier-ranking.html',
  styleUrl: './supplier-ranking.scss'
})
export class SupplierRanking implements AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;

  // ================= Summary Cards =================

  totalSuppliers = 18;

  topSupplier = 'ABC Suppliers';

  averageReliability = 91;

  lowRiskSuppliers = 13;

  // ================= Filters =================

  searchText = '';

  selectedCategory = '';

  selectedRisk = '';

  categories: string[] = [
    'Electronics',
    'Office Supplies',
    'Machinery',
    'IT Equipment',
    'Transportation'
  ];

  // ================= Table Columns =================

  displayedColumns: string[] = [
    'rank',
    'vendor',
    'category',
    'reliability',
    'risk',
    'recommendation',
    'details'
  ];

  // ================= Dummy Data =================

  supplierRankings = [

    {
      rank: 1,
      vendor: 'ABC Suppliers',
      category: 'Electronics',
      reliability: 98,
      risk: 'Low',
      recommendation: 'Highly Recommended'
    },

    {
      rank: 2,
      vendor: 'Global Traders',
      category: 'Office Supplies',
      reliability: 95,
      risk: 'Low',
      recommendation: 'Recommended'
    },

    {
      rank: 3,
      vendor: 'Vision Technologies',
      category: 'IT Equipment',
      reliability: 91,
      risk: 'Low',
      recommendation: 'Recommended'
    },

    {
      rank: 4,
      vendor: 'Prime Industries',
      category: 'Machinery',
      reliability: 84,
      risk: 'Medium',
      recommendation: 'Consider'
    },

    {
      rank: 5,
      vendor: 'Delta Logistics',
      category: 'Transportation',
      reliability: 67,
      risk: 'High',
      recommendation: 'Not Recommended'
    }

  ];

  dataSource = new MatTableDataSource(this.supplierRankings);

  constructor() {

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {

      const filters = JSON.parse(filter);

      const searchMatch =
        data.vendor.toLowerCase().includes(filters.search) ||
        data.category.toLowerCase().includes(filters.search);

      const categoryMatch =
        !filters.category ||
        data.category === filters.category;

      const riskMatch =
        !filters.risk ||
        data.risk === filters.risk;

      return searchMatch && categoryMatch && riskMatch;

    };

  }

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort;

  }

  // ================= Search & Filters =================

  applyFilters(): void {

    this.dataSource.filter = JSON.stringify({

      search: this.searchText.trim().toLowerCase(),

      category: this.selectedCategory,

      risk: this.selectedRisk

    });

  }

}