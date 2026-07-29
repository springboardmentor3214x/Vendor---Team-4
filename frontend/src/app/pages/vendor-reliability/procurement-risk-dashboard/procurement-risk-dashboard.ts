import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

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

  totalVendors = 0;

  lowRisk = 0;

  mediumRisk = 0;

  highRisk = 0;

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

  vendors: any[] = [];

  dataSource = new MatTableDataSource<any>([]);

  constructor(
  private vendorReliabilityService: VendorReliabilityService,
  private router: Router,
  private cdr: ChangeDetectorRef
) {

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {

      const filters = JSON.parse(filter);

      const searchMatch =
        data.vendor_name.toLowerCase().includes(filters.search) ||
        data.vendor_category.toLowerCase().includes(filters.search);

      const categoryMatch =
        !filters.category ||
        data.vendor_category === filters.vendor_category;

      const riskMatch =
        !filters.risk ||
        data.risk_level === filters.risk;

      return searchMatch && categoryMatch && riskMatch;

    };

  }

  ngAfterViewInit(): void {

  this.dataSource.sort = this.sort;

  this.loadRiskDashboard();

}

  loadRiskDashboard(): void {

  this.vendorReliabilityService.getRankings().subscribe({

    next: (response: any[]) => {

      console.log(response);

      this.vendors = response;

      this.dataSource.data = response;

      this.totalVendors = response.length;

      this.lowRisk = response.filter(
        x => x.risk_level === 'Low Risk'
      ).length;

      this.mediumRisk = response.filter(
        x => x.risk_level === 'Medium Risk'
      ).length;

      this.highRisk = response.filter(
        x => x.risk_level === 'High Risk'
      ).length;

      this.cdr.detectChanges();

    },

    error: err => {

      console.error(err);

    }

  });

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