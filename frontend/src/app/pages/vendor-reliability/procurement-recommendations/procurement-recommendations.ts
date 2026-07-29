import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef, OnInit } from '@angular/core';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

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
export class ProcurementRecommendations implements OnInit, AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;

  // ================= Summary Cards =================

  totalVendors = 0;

  recommendedVendors = 0;

  notRecommended = 0;

  averageReliability = 0;

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


  dataSource = new MatTableDataSource<any>([]);
  constructor(
  private vendorReliabilityService: VendorReliabilityService,
  private router: Router,
  private cdr: ChangeDetectorRef
) {

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

  ngOnInit(): void {
  this.loadRecommendations();
}

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort;

  }

  loadRecommendations(): void {

  this.vendorReliabilityService.getRankings().subscribe({

    next: (response) => {

      const vendors = response.map((item: any) => ({

        vendor_id: item.vendor_id,
        vendor: item.vendor_name,
        category: item.vendor_category,
        reliability: item.reliability_score,
        risk: item.risk_level,
        recommendation: item.recommendation

      }));

      this.dataSource.data = vendors;

      this.totalVendors = vendors.length;

      this.recommendedVendors =
        vendors.filter(v => v.recommendation !== 'Not Recommended').length;

      this.notRecommended =
        vendors.filter(v => v.recommendation === 'Not Recommended').length;

      this.averageReliability =
        vendors.length
          ? Math.round(
              vendors.reduce((sum, v) => sum + v.reliability, 0) /
                vendors.length
            )
          : 0;

      this.categories = [...new Set(vendors.map(v => v.category))];

      this.cdr.detectChanges();

    },

    error: (err) => {
      console.error('Recommendations Error', err);
    }

  });

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