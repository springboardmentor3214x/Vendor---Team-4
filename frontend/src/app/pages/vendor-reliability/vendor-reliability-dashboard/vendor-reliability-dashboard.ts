import { AfterViewInit, Component, OnInit, ViewChild,
  ChangeDetectorRef} from '@angular/core';
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
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

@Component({
  selector: 'app-vendor-reliability-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './vendor-reliability-dashboard.html',
  styleUrl: './vendor-reliability-dashboard.scss'
})
export class VendorReliabilityDashboard implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private reliabilityService: VendorReliabilityService, private cdr: ChangeDetectorRef) {}

  totalVendors = 0; averageReliability = 0; highReliability = 0; mediumReliability = 0; highRisk = 0; topVendor = '-'; recommendedVendors = 0;
  searchText = ''; selectedCategory = ''; selectedRisk = '';
  categories: string[] = [];
  displayedColumns = ['vendor', 'category', 'reliability', 'risk', 'recommendation', 'details', 'compare'];
  vendorReliability: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  ngOnInit(): void { this.loadData(); }
  ngAfterViewInit(): void { this.dataSource.sort = this.sort; }

  loadData(): void {
    this.reliabilityService.getDashboard().subscribe({
      next: d => {
        this.totalVendors = Number(d?.total_vendors ?? 0);
        this.averageReliability = Number(d?.average_reliability_score ?? 0);
        this.highReliability = Number(d?.high_reliability_vendors ?? 0);
        this.mediumReliability = Number(d?.medium_reliability_vendors ?? 0);
        this.highRisk = Number(d?.high_risk_vendors ?? 0);
        this.topVendor = d?.top_vendor || '-';
        this.recommendedVendors = Number(d?.recommended_vendors ?? 0);
        this.cdr.detectChanges();
      },
      error: err => console.error('Failed to load reliability dashboard; using rankings fallback:', err)
    });

    this.reliabilityService.getRankings().subscribe({
      next: rows => {
        const rankings = Array.isArray(rows) ? rows : [];

        this.vendorReliability = rankings.map((r: any) => ({
          id: r.vendor_id,
          vendor: r.vendor_name,
          category: r.vendor_category || '-',
          reliability: Number(r.reliability_score ?? 0),
          risk: String(r.risk_level || '').replace(' Risk', ''),
          recommendation: r.recommendation
        }));

        this.dataSource.data = this.vendorReliability;
        this.categories = [...new Set(this.vendorReliability.map(x => x.category))];

        // Rankings are also a reliable fallback for the dashboard cards.
        this.totalVendors = this.vendorReliability.length;
        this.averageReliability = this.totalVendors
          ? Number((this.vendorReliability.reduce((sum, x) => sum + x.reliability, 0) / this.totalVendors).toFixed(2))
          : 0;
        this.highReliability = this.vendorReliability.filter(x => x.reliability >= 90).length;
        this.mediumReliability = this.vendorReliability.filter(x => x.reliability >= 60 && x.reliability < 90).length;
        this.highRisk = this.vendorReliability.filter(x => x.risk === 'High').length;
        this.topVendor = this.vendorReliability[0]?.vendor || '-';
        this.recommendedVendors = this.vendorReliability.filter(x => x.recommendation !== 'Not Recommended').length;

        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: err => console.error('Failed to load reliability rankings:', err)
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any): boolean =>
      (!search || data.vendor.toLowerCase().includes(search) || data.category.toLowerCase().includes(search)) &&
      (!this.selectedCategory || data.category === this.selectedCategory) &&
      (!this.selectedRisk || data.risk === this.selectedRisk);
    this.dataSource.filter = `${Date.now()}`;
  }

  compareVendor(vendor: any): void {
    console.log('Compare Vendor:', vendor);
  }
}
