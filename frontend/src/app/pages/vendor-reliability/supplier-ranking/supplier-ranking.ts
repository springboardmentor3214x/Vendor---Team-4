import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

import { VendorReliabilityService } from '../../../services/vendor-reliability.service';
import { ChangeDetectorRef } from '@angular/core';

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

  totalSuppliers = 0;

  topSupplier = '';

  averageReliability = 0;

  lowRiskSuppliers = 0;

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

  supplierRankings: any[] = [];
  
  dataSource = new MatTableDataSource(this.supplierRankings);

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
        data.vendor_category === filters.category;

      const riskMatch =
        !filters.risk ||
        data.risk_level === filters.risk;

      return searchMatch && categoryMatch && riskMatch;

    };

  }

  ngAfterViewInit(): void {

  this.dataSource.sort = this.sort;

  this.loadRankings();

}

  loadRankings(): void {

  this.vendorReliabilityService
    .getRankings()
    .subscribe({

      next: (response: any[]) => {

        console.log("Rankings:", response);

        this.supplierRankings = response;

        this.dataSource.data = response;

        this.totalSuppliers = response.length;

        this.topSupplier =
          response.length > 0
            ? response[0].vendor_name
            : '';

        this.averageReliability =
          response.length > 0
            ? Math.round(
                response.reduce(
                  (sum, vendor) => sum + vendor.reliability_score,
                  0
                ) / response.length
              )
            : 0;

        this.lowRiskSuppliers =
          response.filter(
            vendor => vendor.risk_level === 'Low Risk'
          ).length;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(err);

      }

    });

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