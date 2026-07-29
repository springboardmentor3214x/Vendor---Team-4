import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController,
  Tooltip,
  Legend
} from 'chart.js';

import {
  ChartConfiguration,
  ChartOptions
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController,
  Tooltip,
  Legend
);

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
    MatButtonModule,
    BaseChartDirective
  ],
  templateUrl: './performance-trend-analysis.html',
  styleUrl: './performance-trend-analysis.scss'
})
export class PerformanceTrendAnalysis implements OnInit, AfterViewInit {

  @ViewChild(MatSort)
  sort!: MatSort;

  // ================= Summary Cards =================

  averageReliability = 0;

  improvingVendors = 0;

  decliningVendors = 0;

  stableVendors = 0;

  // ================= Pie Chart =================

public pieChartLabels: string[] = [
  'Low Risk',
  'Medium Risk',
  'High Risk'
];

public pieChartData = {
  labels: this.pieChartLabels,
  datasets: [{
  data: [0,0,0],
  backgroundColor: [
    '#4CAF50',
    '#FFC107',
    '#F44336'
  ]
}]
};

public pieChartType: 'pie' = 'pie';


// ================= Category Chart =================

public categoryChartData: ChartConfiguration<'bar'>['data'] = {
  labels: [],
  datasets: [{
  label: 'Average Reliability',
  data: [],
  backgroundColor: [
    '#42A5F5',
    '#26A69A',
    '#FFA726',
    '#AB47BC',
    '#EF5350'
  ],
  borderRadius: 8
}]
};

public categoryChartOptions: ChartOptions<'bar'> = {
  responsive: true
};


// ================= Top Vendors Chart =================

public vendorChartData: ChartConfiguration<'bar'>['data'] = {
  labels: [],
  datasets: [{
  label: 'Reliability',
  data: [],
  backgroundColor: '#3F51B5',
  borderRadius: 8,
  barThickness: 20
}]
};

public vendorChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  indexAxis: 'y'
};

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

  displayedColumns = [
  'vendor',
  'category',
  'monthly',
  'trend',
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

      return searchMatch && categoryMatch;

    };

  }

  ngOnInit(): void {
  this.loadTrendData();
}

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort;

  }

  loadTrendData(): void {

  this.vendorReliabilityService.getRankings().subscribe({

    next: (response) => {
      console.log(response);
      
      const trends = response.map((item: any) => ({

        vendor_id: item.vendor_id,
        vendor: item.vendor_name,
        category: item.vendor_category,
        monthly: item.reliability_score,

        trend:
          item.reliability_score >= 90
            ? 'Improving'
            : item.reliability_score >= 60
            ? 'Stable'
            : 'Declining'

      }));
      console.log(trends);
      this.dataSource.data = trends;
      // ---------------- Pie Chart ----------------

const low = response.filter((v: any) => v.risk_level === 'Low Risk').length;
const medium = response.filter((v: any) => v.risk_level === 'Medium Risk').length;
const high = response.filter((v: any) => v.risk_level === 'High Risk').length;

this.pieChartData.datasets[0].data = [
  low,
  medium,
  high
];


// ---------------- Category Chart ----------------

const categoryMap: any = {};

response.forEach((v: any) => {

  if (!categoryMap[v.vendor_category]) {

    categoryMap[v.vendor_category] = {
      total: 0,
      count: 0
    };

  }

  categoryMap[v.vendor_category].total += v.reliability_score;
  categoryMap[v.vendor_category].count++;

});

this.categoryChartData.labels =
  Object.keys(categoryMap);

this.categoryChartData.datasets[0].data =
  Object.values(categoryMap).map((x: any) =>
    +(x.total / x.count).toFixed(1)
  );


// ---------------- Top Vendors ----------------

const top = [...response]
  .sort((a, b) => b.reliability_score - a.reliability_score)
  .slice(0, 10);

this.vendorChartData.labels =
  top.map(v => v.vendor_name);

this.vendorChartData.datasets[0].data =
  top.map(v => v.reliability_score);

      this.averageReliability = trends.length
        ? Math.round(
            trends.reduce((sum, v) => sum + v.monthly, 0) /
              trends.length
          )
        : 0;

      this.improvingVendors =
        trends.filter(v => v.trend === 'Improving').length;

      this.stableVendors =
        trends.filter(v => v.trend === 'Stable').length;

      this.decliningVendors =
        trends.filter(v => v.trend === 'Declining').length;

      this.categories = [...new Set(trends.map(v => v.category))];

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

      category: this.selectedCategory

    });

  }

}