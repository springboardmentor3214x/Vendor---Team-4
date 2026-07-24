import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface VendorApprovalModel {

  vendorId: string;

  companyName: string;

  category: string;

  contactPerson: string;

  email: string;

  phone: string;

  vendorStatus: string;

  approvalStatus: string;

  registeredDate: string;

}

@Component({
  selector: 'app-vendor-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './vendor-approval.html',
  styleUrl: './vendor-approval.scss'
})

export class VendorApproval {

  constructor(private router: Router) {}

  // ================= Dashboard Summary =================

  pendingCount = 2;

  approvedToday = 5;

  rejectedToday = 1;

  // ================= Search & Filters =================

  searchText = '';

  selectedCategory = '';

  selectedApprovalStatus = '';

  // ================= Vendor Data =================

  vendors: VendorApprovalModel[] = [

    {
      vendorId: 'V001',
      companyName: 'ABC Technologies',
      category: 'IT Vendors',
      contactPerson: 'John Smith',
      email: 'john@abctech.com',
      phone: '9876543210',
      vendorStatus: 'Pending',
      approvalStatus: 'Pending',
      registeredDate: '20-07-2026'
    },

    {
      vendorId: 'V002',
      companyName: 'Global Logistics',
      category: 'Logistics Partners',
      contactPerson: 'David Lee',
      email: 'david@global.com',
      phone: '9876543211',
      vendorStatus: 'Pending',
      approvalStatus: 'Pending',
      registeredDate: '21-07-2026'
    },

    {
      vendorId: 'V003',
      companyName: 'Tech Solutions',
      category: 'Service Providers',
      contactPerson: 'Alex Brown',
      email: 'alex@techsolutions.com',
      phone: '9876543212',
      vendorStatus: 'Active',
      approvalStatus: 'Approved',
      registeredDate: '18-07-2026'
    }

  ];

  // ================= Search & Filter =================

  filteredVendors(): VendorApprovalModel[] {

    return this.vendors.filter(vendor => {

      const matchesSearch =

        vendor.vendorId.toLowerCase().includes(this.searchText.toLowerCase()) ||

        vendor.companyName.toLowerCase().includes(this.searchText.toLowerCase()) ||

        vendor.contactPerson.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesCategory =

        !this.selectedCategory ||

        vendor.category === this.selectedCategory;

      const matchesApproval =

        !this.selectedApprovalStatus ||

        vendor.approvalStatus === this.selectedApprovalStatus;

      return matchesSearch &&

             matchesCategory &&

             matchesApproval;

    });

  }
    // ================= View Vendor =================

  viewVendor(vendor: VendorApprovalModel): void {

    /*
    In production:

    

    */
   this.router.navigate(['/vendor-details', vendor.vendorId]);
   /*

    console.log('View Vendor');

    console.log(vendor);
*/
  }

  // ================= Approve Vendor =================

  approveVendor(vendor: VendorApprovalModel): void {

    const confirmed = confirm(

      `Approve vendor "${vendor.companyName}"?`

    );

    if (!confirmed) {

      return;

    }

    vendor.approvalStatus = 'Approved';

    vendor.vendorStatus = 'Active';

    this.pendingCount = this.vendors.filter(

      v => v.approvalStatus === 'Pending'

    ).length;

    /*
    ============================================================
    FastAPI Integration
    ============================================================

    Endpoint

    PUT /api/vendors/{vendorId}/approve

    ============================================================

    Backend Responsibilities

    - Validate Vendor ID exists

    - Validate logged-in user has approval permission

    - Update Approval Status = Approved

    - Update Vendor Status = Active
      (according to business rules)

    - Update Approved By

    - Update Approved Date

    - Update Last Updated By

    - Update Last Updated Date

    - Store audit information

    - Return updated vendor details

    ============================================================
    Procurement Integration

    Only vendors with

    Approval Status = Approved

    AND

    Vendor Status = Active

    should be available in Procurement.

    ============================================================

    */

    alert(`${vendor.companyName} approved successfully.`);

  }

  // ================= Reject Vendor =================

  rejectVendor(vendor: VendorApprovalModel): void {

    const reason = prompt(

      'Enter rejection reason:'

    );

    if (reason === null) {

      return;

    }

    vendor.approvalStatus = 'Rejected';

    vendor.vendorStatus = 'Rejected';

    this.pendingCount = this.vendors.filter(

      v => v.approvalStatus === 'Pending'

    ).length;

    /*
    ============================================================
    FastAPI Integration
    ============================================================

    Endpoint

    PUT /api/vendors/{vendorId}/reject

    ============================================================

    Backend Responsibilities

    - Validate Vendor ID exists

    - Validate logged-in user has approval permission

    - Store rejection reason

    - Update Approval Status = Rejected

    - Update Vendor Status
      (according to business rules)

    - Update Rejected By

    - Update Rejected Date

    - Update Last Updated By

    - Update Last Updated Date

    - Store audit information

    ============================================================

    Future Modules

    Procurement

    Vendor Performance

    Vendor Reliability

    Reports

    Contracts

    use this vendor information.

    ============================================================

    */

    alert(`${vendor.companyName} rejected successfully.`);

  }

}