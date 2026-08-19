import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

@Component({ selector: 'app-reliability-score', standalone: true, imports: [CommonModule, MatCardModule, MatProgressBarModule], templateUrl: './reliability-score.html', styleUrl: './reliability-score.scss' })
export class ReliabilityScore implements OnInit {
  constructor(private route: ActivatedRoute, private reliabilityService: VendorReliabilityService, private cdr: ChangeDetectorRef) {}
  vendorName = '-'; vendorCategory = '-'; reliabilityScore = 0; riskLevel = '-'; recommendation = '-'; deliveryScore = 0; qualityScore = 0; communicationScore = 0; contractScore = 0; purchaseHistoryScore = 0; issueResolutionScore = 0; completedOrders = 0; averageDelivery = 0; averageQuality = 0; averageCommunication = 0; issueResolutionRate = 0;
  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('vendorId') || 0);
    if (id) { this.load(id); return; }
    this.reliabilityService.getRankings().subscribe({
      next: (rows: any[]) => { const first = Array.isArray(rows) ? rows[0] : null; if (first?.vendor_id) this.load(Number(first.vendor_id)); this.cdr.detectChanges(); },
      error: (error: unknown) => console.error('Failed to load reliability rankings:', error)
    });
  }
  private load(id: number): void {
    this.reliabilityService.getVendor(id).subscribe({
      next: (d: any) => {
        this.vendorName = d?.vendor_name || '-'; this.vendorCategory = d?.vendor_category || d?.category || '-'; this.reliabilityScore = Number(d?.reliability_score ?? 0); this.riskLevel = d?.risk_level || '-'; this.recommendation = d?.recommendation || '-';
        this.deliveryScore = Number(d?.delivery_score ?? 0); this.qualityScore = Number(d?.quality_score ?? 0); this.communicationScore = Number(d?.communication_score ?? 0); this.purchaseHistoryScore = Number(d?.purchase_history_score ?? 0); this.issueResolutionScore = Number(d?.issue_resolution_score ?? 0); this.contractScore = Number(d?.contract_score ?? this.purchaseHistoryScore); this.completedOrders = Number(d?.completed_orders ?? 0); this.averageDelivery = this.deliveryScore; this.averageQuality = this.qualityScore; this.averageCommunication = this.communicationScore; this.issueResolutionRate = this.issueResolutionScore;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load reliability score:', error)
    });
  }
}
