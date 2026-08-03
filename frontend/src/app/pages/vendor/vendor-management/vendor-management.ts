import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { VendorService } from '../../../services/vendor.service';

@Component({
  selector: 'app-vendor-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './vendor-management.html',
  styleUrl: './vendor-management.scss'
})

export class VendorManagement implements OnInit {

  constructor(
    private router: Router,
    private vendorService: VendorService
  ) {}

  // ================= Dashboard Statistics =================
  // Retrieved from the FastAPI backend: GET /vendors/dashboard

  totalVendors = 0;

  approved = 0;

  pending = 0;

  active = 0;

  suspended = 0;

  rejected = 0;

  errorMessage = '';

  ngOnInit(): void {

    this.vendorService.getDashboard().subscribe({
      next: (stats) => {
        this.totalVendors = stats.total_vendors;
        this.approved = stats.approved_vendors;
        this.pending = stats.pending_vendors;
        this.active = stats.active_vendors;
        this.suspended = stats.suspended_vendors;
        this.rejected = stats.rejected_vendors;
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Failed to load vendor dashboard.';
      }
    });

  }

  // ================= Vendor List =================

  openVendorList(): void {

    this.router.navigate(['/vendor-list']);

  }

  // ================= Add Vendor =================

  addVendor(): void {

    this.router.navigate(['/add-vendor']);

  }

  // ================= Vendor Approval =================

  approval(): void {

    this.router.navigate(['/vendor-approval']);

  }

  // ================= Vendor Documents =================

  documents(): void {

    /*
    At present, uploaded documents are managed
    through the Add Vendor, Edit Vendor,
    and Vendor Details pages.
    */

    this.router.navigate(['/vendor-list']);

  }

  // ================= Vendor Details =================

  details(): void {

    this.router.navigate(['/vendor-list']);

  }

}
