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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-procurement-recommendations',
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
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './procurement-recommendations.html',
  styleUrl: './procurement-recommendations.scss'
})
export class ProcurementRecommendations implements AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;

  // ================= Summary Cards =================

  totalVendors = 18;

  recommendedVendors = 12;

  notRecommended = 3;

  averageReliability = 91;

  // ================= Filters =================

  searchText = '';

  selectedCategory = '';

  selectedRecommendation = '';

  categories: string[] = [
    'Electronics',
    'Office Supplies',
    'Machinery',
    'IT Equipment',
    'Transportation'
  ];

  // ================= Table =================

  displayedColumns: string[] = [
    'vendor',
    'category',
    'reliability',
    'risk',
    'recommendation',
    'details'
  ];

  recommendations = [

    {
      vendor: 'ABC Suppliers',
      category: 'Electronics',
      reliability: 98,
      risk: 'Low',
      recommendation: 'Highly Recommended'
    },

    {
      vendor: 'Global Traders',
      category: 'Office Supplies',
      reliability: 94,
      risk: 'Low',
      recommendation: 'Highly Recommended'
    },

    {
      vendor: 'Vision Technologies',
      category: 'IT Equipment',
      reliability: 90,
      risk: 'Low',
      recommendation: 'Recommended'
    },

    {
      vendor: 'Prime Industries',
      category: 'Machinery',
      reliability: 82,
      risk: 'Medium',
      recommendation: 'Recommended'
    },

    {
      vendor: 'Delta Logistics',
      category: 'Transportation',
      reliability: 65,
      risk: 'High',
      recommendation: 'Not Recommended'
    }

  ];

  dataSource = new MatTableDataSource(this.recommendations);

  constructor() {

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {

      const filters = JSON.parse(filter);

      const searchMatch =
        data.vendor.toLowerCase().includes(filters.search) ||
        data.category.toLowerCase().includes(filters.search);

      const categoryMatch =
        !filters.category ||
        data.category === filters.category;

      const recommendationMatch =
        !filters.recommendation ||
        data.recommendation === filters.recommendation;

      return searchMatch && categoryMatch && recommendationMatch;

    };

  }

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort;

  }

  // ================= Filters =================

  applyFilters(): void {

    this.dataSource.filter = JSON.stringify({

      search: this.searchText.trim().toLowerCase(),

      category: this.selectedCategory,

      recommendation: this.selectedRecommendation

    });

  }

}