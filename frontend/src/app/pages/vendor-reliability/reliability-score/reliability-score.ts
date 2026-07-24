import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-reliability-score',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './reliability-score.html',
  styleUrl: './reliability-score.scss'
})
export class ReliabilityScore {

  // ================= Vendor Information =================

  vendorName = 'ABC Suppliers';

  vendorCategory = 'Electronics';

  reliabilityScore = 94;

  riskLevel = 'Low Risk';

  recommendation = 'Highly Recommended';

  // ================= Reliability Factors =================

  deliveryScore = 96;

  qualityScore = 95;

  communicationScore = 92;

  contractScore = 94;

  purchaseHistoryScore = 91;

  issueResolutionScore = 96;

  // ================= Summary =================

  completedOrders = 48;

  averageDelivery = 96;

  averageQuality = 95;

  averageCommunication = 92;

  issueResolutionRate = 97;

}