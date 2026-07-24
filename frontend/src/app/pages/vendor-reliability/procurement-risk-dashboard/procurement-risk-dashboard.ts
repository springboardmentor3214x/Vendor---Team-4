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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-procurement-risk-dashboard',
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
  templateUrl: './procurement-risk-dashboard.html',
  styleUrl: './procurement-risk-dashboard.scss'
})
export class ProcurementRiskDashboard implements AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;

  // ================= Summary Cards =================

  totalVendors = 18;

  lowRisk = 11;

  mediumRisk = 5;

  highRisk = 2;

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
    'vendor',
    'category',
    'reliability',
    'risk',
    'approval',
    'details'
  ];

  // ================= Dummy Data =================

  vendors = [

    {
      vendor: 'ABC Suppliers',
      category: 'Electronics',
      reliability: 98,
      risk: 'Low',
      approval: 'Not Required'
    },

    {
      vendor: 'Global Traders',
      category: 'Office Supplies',
      reliability: 92,
      risk: 'Low',
      approval: 'Not Required'
    },

    {
      vendor: 'Vision Technologies',
      category: 'IT Equipment',
      reliability: 86,
      risk: 'Medium',
      approval: 'Manager Approval'
    },

    {
      vendor: 'Prime Industries',
      category: 'Machinery',
      reliability: 80,
      risk: 'Medium',
      approval: 'Manager Approval'
    },

    {
      vendor: 'Delta Logistics',
      category: 'Transportation',
      reliability: 64,
      risk: 'High',
      approval: 'Additional Approval Required'
    }

  ];

  dataSource = new MatTableDataSource(this.vendors);

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

  // ================= Filters =================

  applyFilters(): void {

    this.dataSource.filter = JSON.stringify({

      search: this.searchText.trim().toLowerCase(),

      category: this.selectedCategory,

      risk: this.selectedRisk

    });

  }

}