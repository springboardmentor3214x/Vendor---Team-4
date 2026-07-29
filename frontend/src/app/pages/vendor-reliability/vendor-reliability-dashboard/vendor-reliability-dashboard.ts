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
import { OnInit } from '@angular/core';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';
@Component({
  selector: 'app-vendor-reliability-dashboard',
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
  templateUrl: './vendor-reliability-dashboard.html',
  styleUrl: './vendor-reliability-dashboard.scss'
})

export class VendorReliabilityDashboard implements OnInit, AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;

  // ================= Summary Cards =================

  totalVendors = 0;
  averageReliability = 0;
  highReliability = 0;
  mediumReliability = 0;
  highRisk = 0;
  topVendor = '';
  recommendedVendors = 0;
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
    'recommendation',
    'details',
    'compare'
  ];

  // ================= Dummy Data =================

  vendorReliability = [

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
      recommendation: 'Recommended'
    },

    {
      vendor: 'Vision Technologies',
      category: 'IT Equipment',
      reliability: 89,
      risk: 'Medium',
      recommendation: 'Recommended'
    },

    {
      vendor: 'Prime Industries',
      category: 'Machinery',
      reliability: 82,
      risk: 'Medium',
      recommendation: 'Consider'
    },

    {
      vendor: 'Delta Logistics',
      category: 'Transportation',
      reliability: 66,
      risk: 'High',
      recommendation: 'Not Recommended'
    }

  ];

  dataSource = new MatTableDataSource<any>([]);

  constructor(
  private vendorReliabilityService: VendorReliabilityService
) {

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

ngOnInit(): void {

  this.loadDashboard();

  this.loadRankings();

}

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort;

  }

  loadDashboard(): void {

  this.vendorReliabilityService.getDashboard().subscribe({

    next: (response) => {

      this.totalVendors = response.total_vendors;

      this.averageReliability = response.average_reliability_score;

      this.highReliability = response.high_reliability_vendors;

      this.mediumReliability = response.medium_reliability_vendors;

      this.highRisk = response.high_risk_vendors;

      this.topVendor = response.top_vendor;

      this.recommendedVendors = response.recommended_vendors;

    },

    error: (err) => {

      console.error('Dashboard Error', err);

    }

  });

}

loadRankings(): void {

  this.vendorReliabilityService.getRankings().subscribe({

    next: (response) => {

      const vendors = response.map((item: any) => ({

        id: item.vendor_id,

        vendor: item.vendor_name,

        category: item.vendor_category,

        reliability: item.reliability_score,

        risk: item.risk_level,

        recommendation: item.recommendation

      }));

      this.dataSource.data = vendors;

      this.categories = [...new Set(
        vendors.map((v: any) => v.category)
      )];

    },

    error: (err) => {

      console.error('Rankings Error', err);

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

  // ================= Compare =================

  compareVendor(vendor: any): void {

    console.log('Compare Vendor:', vendor);

    // Later:
    // this.router.navigate(['/vendor-comparison', vendor.id]);

  }

}