import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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

export class VendorManagement {

  constructor(private router: Router) {}

  /*
  ===========================================================

  Temporary Dashboard Data

  Future Backend

  GET /api/vendors/dashboard

  FastAPI will retrieve dashboard statistics
  from PostgreSQL.

  ===========================================================
  */

  totalVendors = 42;

  approved = 31;

  pending = 6;

  active = 28;

  suspended = 2;

  rejected = 3;

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
    Future Route

    /vendor-documents

    At present, uploaded documents are managed
    through the Add Vendor, Edit Vendor,
    and Vendor Details pages.
    */

    this.router.navigate(['/vendor-list']);

  }

  // ================= Vendor Details =================

  details(): void {

    /*
    Future Navigation

    this.router.navigate(['/vendor-details', vendorId]);

    Vendor ID will be passed from the
    selected vendor record.
    */

    this.router.navigate(['/vendor-details', 'V001']);

  }

  /*
  ===========================================================

  Backend Responsibilities

  GET /api/vendors/dashboard

  Return

  - Total Vendors

  - Approved Vendors

  - Pending Vendors

  - Active Vendors

  - Suspended Vendors

  - Rejected Vendors

  ===========================================================

  Procurement Integration

  Only vendors whose

  Approval Status = Approved

  AND

  Vendor Status = Active

  are available during Procurement.

  ===========================================================

  Database Relationships

  Vendor

  -> Purchase Orders

  -> Procurement Records

  -> Uploaded Documents

  -> Contracts (Future)

  ===========================================================

  Future Module Integration

  Procurement Management

  Vendor Performance

  Vendor Reliability

  Reports & Dashboards

  Contract Management

  ===========================================================

  */

}