import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { VendorPerformanceService } from '../../../services/vendor-performance.service';

@Component({
  selector: 'app-vendor-ranking',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './vendor-ranking.html',
  styleUrl: './vendor-ranking.scss'
})
export class VendorRanking implements OnInit {
  constructor(
    private router: Router,
    private performanceService: VendorPerformanceService,
    private cdr: ChangeDetectorRef
  ) {}

  totalVendors = 0;
  topVendor = '-';
  averagePerformance = 0;
  lastUpdated = '-';
  displayedColumns = ['rank', 'vendor', 'category', 'overall', 'delivery', 'quality', 'communication', 'service'];
  vendorRankings: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  ngOnInit(): void { this.loadRankings(); }

  loadRankings(): void {
    this.performanceService.getRankings().subscribe({
      next: (rows: any[]) => {
        this.vendorRankings = (Array.isArray(rows) ? rows : []).map((row: any, index: number) => ({
          rank: Number(row.rank ?? index + 1),
          vendor: row.vendor_name ?? row.vendor ?? '-',
          category: row.vendor_category ?? row.category ?? '-',
          overall: Number(row.overall_vendor_score ?? row.overall_score ?? 0),
          delivery: Number(row.on_time_delivery_rate ?? 0),
          quality: Number(row.average_quality_score ?? row.quality_score ?? 0),
          communication: Math.max(0, Math.min(100, 100 - Number(row.average_response_time ?? 0))),
          service: Number(row.average_service_rating ?? row.service_rating ?? 0) * 20
        }));
        this.dataSource.data = this.vendorRankings;
        this.totalVendors = this.vendorRankings.length;
        this.topVendor = this.vendorRankings[0]?.vendor || '-';
        this.averagePerformance = this.totalVendors
          ? Math.round((this.vendorRankings.reduce((sum, row) => sum + row.overall, 0) / this.totalVendors) * 100) / 100
          : 0;
        this.lastUpdated = new Date().toLocaleString('en-GB');
        this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load vendor rankings:', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement | null)?.value?.trim().toLowerCase() ?? '';
    this.dataSource.filter = filterValue;
  }

  goBack(): void { this.router.navigate(['/vendor-performance-dashboard']); }
}
