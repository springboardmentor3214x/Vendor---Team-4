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

  vendor = {

    vendorId: 'V001',

    companyName: 'ABC Technologies',

    vendorCategory: 'IT',

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

    approvalStatus: 'Approved'

  };

  documents = [

    'GST Certificate.pdf',

    'PAN Card.pdf',

    'Registration Certificate.pdf',

    'ISO Certificate.pdf'

  ];

  back() {

    this.router.navigate(['/vendor-list']);

  }

  editVendor() {

    this.router.navigate(['/edit-vendor', this.vendor.vendorId]);

  }

}