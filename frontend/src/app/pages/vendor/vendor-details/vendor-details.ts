import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './vendor-details.html',
  styleUrl: './vendor-details.scss'
})

export class VendorDetails {

  constructor(private router: Router) {}

  /*
  ============================================================
  Temporary Sample Data

  FastAPI Endpoint

  GET /api/vendors/{vendorId}

  Backend will retrieve:

  - Vendor Information
  - Uploaded Documents
  - Approval Status
  - Vendor Status
  - Audit Information

  from PostgreSQL.

  ============================================================
  */

  vendor = {

    vendorId: 'V001',

    companyName: 'ABC Technologies',

    vendorCategory: 'IT Vendors',

    contactPerson: 'John Smith',

    designation: 'Sales Manager',

    email: 'abc@gmail.com',

    phone: '9876543210',

    alternatePhone: '9876543211',

    gstNumber: '22ABCDE1234F1Z5',

    panNumber: 'ABCDE1234F',

    registrationNumber: 'REG987654',

    addressLine1: 'Sector 5',

    addressLine2: 'Salt Lake',

    city: 'Kolkata',

    state: 'West Bengal',

    country: 'India',

    pincode: '700091',

    website: 'www.abctech.com',

    description: 'IT Service Provider',

    accountNumber: '123456789012',

    ifscCode: 'SBIN0001234',

    paymentTerms: '30 Days',

    vendorStatus: 'Active',

    approvalStatus: 'Approved',

    createdBy: 'Administrator',

    createdDate: '15-07-2026',

    lastUpdatedBy: 'Procurement Manager',

    lastUpdatedDate: '20-07-2026',

    approvedBy: 'Administrator',

    approvedDate: '21-07-2026'

  };

  /*
  ============================================================
  Future Backend

  Documents will be retrieved from PostgreSQL
  using the Vendor ID.

  One Vendor

      ↓

  Multiple Uploaded Documents

  ============================================================
  */

  documents = [

    'GST Certificate.pdf',

    'PAN Card.pdf',

    'Registration Certificate.pdf',

    'ISO Certificate.pdf'

  ];

  // ================= Navigation =================

  back(): void {

    this.router.navigate(['/vendor-list']);

  }

  editVendor(): void {

    this.router.navigate(['/edit-vendor', this.vendor.vendorId]);

  }

  // ================= Documents =================

  viewDocument(document: string): void {

    /*
    FastAPI

    GET /api/vendor-documents/view/{documentId}

    */

    console.log('View document:', document);

  }

  downloadDocument(document: string): void {

    /*
    FastAPI

    GET /api/vendor-documents/download/{documentId}

    */

    console.log('Download document:', document);

  }

}