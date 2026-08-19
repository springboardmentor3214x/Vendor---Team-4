import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { VendorPerformanceService } from '../../../services/vendor-performance.service';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

@Component({
  selector: 'app-vendor-performance',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './vendor-performance.html',
  styleUrl: './vendor-performance.scss'
})
export class VendorPerformance implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private performanceService: VendorPerformanceService,
    private reliabilityService: VendorReliabilityService,
    private cdr: ChangeDetectorRef
  ) {}

  totalVendors = 0;
  activeVendors = 0;
  averageRating = 0;
  onTimeDelivery = '0%';
  topVendors: any[] = [];

  ngOnInit(): void {
    this.performanceService.getRankings().subscribe({
      next: (rows: any[]) => {
        const rankings = Array.isArray(rows) ? rows : [];
        this.totalVendors = rankings.length;
        this.activeVendors = rankings.length;
        this.topVendors = rankings.slice(0, 3).map((r: any) => ({
          company: r.vendor_name ?? r.vendor ?? '-',
          rating: Number(r.average_service_rating ?? 0),
          delivery: `${Number(r.on_time_delivery_rate ?? 0).toFixed(1)}%`
        }));
        this.averageRating = rankings.length
          ? Math.round(
              (rankings.reduce(
                (sum: number, r: any) => sum + Number(r.average_service_rating ?? 0),
                0
              ) /
                rankings.length) *
                100
            ) / 100
          : 0;
        this.onTimeDelivery = rankings.length
          ? `${Math.round(
              (rankings.reduce(
                (sum: number, r: any) => sum + Number(r.on_time_delivery_rate ?? 0),
                0
              ) /
                rankings.length) *
                10
            ) / 10}%`
          : '0%';
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Failed to load vendor performance overview:', err)
    });

    this.reliabilityService.getRankings().subscribe({
      error: (err: unknown) => console.error('Failed to load reliability data:', err)
    });
  }
}
