import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface VendorApprovalModel {

  vendorId: string;

  companyName: string;

  category: string;

  contactPerson: string;

  status: string;

}

@Component({
  selector: 'app-vendor-approval',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './vendor-approval.html',
  styleUrl: './vendor-approval.scss'
})

export class VendorApproval {

  vendors: VendorApprovalModel[] = [

    {
      vendorId: 'V001',
      companyName: 'ABC Technologies',
      category: 'IT',
      contactPerson: 'John Smith',
      status: 'Pending'
    },

    {
      vendorId: 'V002',
      companyName: 'XYZ Pvt Ltd',
      category: 'Manufacturing',
      contactPerson: 'David Lee',
      status: 'Pending'
    },

    {
      vendorId: 'V003',
      companyName: 'Tech Solutions',
      category: 'Software',
      contactPerson: 'Alex Brown',
      status: 'Pending'
    }

  ];

  approveVendor(vendor: VendorApprovalModel): void {

    vendor.status = 'Approved';

    alert(`${vendor.companyName} approved successfully.`);

  }

  rejectVendor(vendor: VendorApprovalModel): void {

    vendor.status = 'Rejected';

    alert(`${vendor.companyName} rejected.`);

  }

}