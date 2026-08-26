import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VendorPerformanceService } from '../../../services/vendor-performance.service';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

@Component({ selector: 'app-performance-history', standalone: true, imports: [CommonModule, MatCardModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatTableModule, MatIconModule, MatButtonModule], templateUrl: './performance-history.html', styleUrl: './performance-history.scss' })
export class PerformanceHistory implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private performanceService: VendorPerformanceService, private reliabilityService: VendorReliabilityService, private cdr: ChangeDetectorRef) {}
  vendorName = '-'; vendorCategory = '-'; totalOrders = 0; overallPerformance = 0; deliveryRecords = 0; qualityEvaluations = 0; communicationRecords = 0; serviceRatings = 0; complaints = 0; issuesResolved = 0;
  displayedColumns = ['purchaseOrder', 'delivery', 'quality', 'communication', 'service', 'date'];
  performanceHistory: any[] = []; dataSource = new MatTableDataSource<any>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('vendorId') || 0);
    if (id) { this.loadVendor(id); return; }
    this.reliabilityService.getRankings().subscribe({
      next: (rows: any[]) => { const first = Array.isArray(rows) ? rows[0] : null; if (first?.vendor_id) this.loadVendor(Number(first.vendor_id)); this.cdr.detectChanges(); },
      error: (error: unknown) => console.error('Failed to select vendor for history:', error)
    });
  }

  private loadVendor(vendorId: number): void {
    this.performanceService.getVendorPerformance(vendorId).subscribe({
      next: (p: any) => {
        this.vendorName = p?.vendor_name || '-';
        this.vendorCategory = p?.vendor_category || p?.category || '-';
        this.overallPerformance = Number(p?.overall_vendor_score ?? 0);
        this.totalOrders = Number(p?.total_orders ?? 0);
        this.deliveryRecords = Number(p?.delayed_delivery_count ?? 0);
        this.cdr.detectChanges();
        this.loadHistory(vendorId);
      },
      error: (error: unknown) => console.error('Failed to load vendor performance:', error)
    });
  }

  private loadHistory(vendorId: number): void {
    this.performanceService.getHistory(vendorId).subscribe({
      next: (rows: any[]) => {
        const history = Array.isArray(rows) ? rows : [];
        this.performanceHistory = history.map((row: any) => ({
          purchaseOrder: `PO #${row.purchase_order_id}`,
          delivery: Number(row.delivery_delay ?? row.delay_days ?? 0) > 0 ? 'Delayed' : 'On-Time',
          quality: this.qualityLabel(Number(row.quality_score ?? 0)),
          communication: `${Number(row.response_time ?? 0)} min`,
          service: this.serviceLabel(Number(row.service_rating ?? 0)),
          date: row.actual_delivery_date ? new Date(row.actual_delivery_date).toLocaleDateString('en-GB') : '-'
        }));
        this.dataSource.data = this.performanceHistory;
        this.deliveryRecords = history.length;
        this.qualityEvaluations = history.filter((x: any) => Number(x.quality_score ?? 0) > 0).length;
        this.communicationRecords = history.filter((x: any) => Number(x.response_time ?? 0) > 0).length;
        this.serviceRatings = history.filter((x: any) => Number(x.service_rating ?? 0) > 0).length;
        this.overallPerformance = history.length
          ? Math.round((history.reduce((sum: number, x: any) => sum + Number(x.overall_score ?? 0) * 20, 0) / history.length) * 100) / 100
          : this.overallPerformance;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load performance history:', error)
    });
  }

  private qualityLabel(score: number): string { return score >= 4.5 ? 'Excellent' : score >= 3.5 ? 'Good' : score >= 2.5 ? 'Average' : score ? 'Poor' : '-'; }
  private serviceLabel(score: number): string { return score >= 4 ? 'Excellent' : score >= 3 ? 'Good' : score >= 2 ? 'Average' : score ? 'Poor' : '-'; }
  applyFilter(event: Event): void { this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase(); }
  goBack(): void { this.router.navigate(['/vendor-performance-dashboard']); }
}
