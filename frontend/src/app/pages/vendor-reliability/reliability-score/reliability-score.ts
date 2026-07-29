import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

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
export class ReliabilityScore implements OnInit {
  vendorId!: number;

  vendorName = '';
  reliabilityScore = 0;
  riskLevel = '';
  recommendation = '';
  lastCalculated = '';
  constructor(
  private route: ActivatedRoute,
  private vendorReliabilityService: VendorReliabilityService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {

    this.vendorId = Number(
      this.route.snapshot.paramMap.get('id')
    );
    console.log("Vendor ID:", this.vendorId);

    this.loadVendorReliability();

  }

  loadVendorReliability(): void {

  console.log("Calling API for Vendor:", this.vendorId);

  this.vendorReliabilityService
    .getVendorReliability(this.vendorId)
    .subscribe({

      next: (response: any) => {

  console.log("Response:", response);

  setTimeout(() => {
    this.vendorName = response.vendor_name;
    this.reliabilityScore = response.reliability_score;
    this.riskLevel = response.risk_level;
    this.recommendation = response.recommendation;
    this.lastCalculated = response.last_calculated;

    this.cdr.detectChanges();
    console.log("vendorName =", this.vendorName);
  });

},

      error: (err) => {

        console.error("API Error:", err);

      }

    });

}

}
