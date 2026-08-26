import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { VendorService, VendorRecord } from '../../../services/vendor.service';

interface VendorApprovalModel {

  id: number;

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

export class VendorApproval implements OnInit {

  constructor(
  private router: Router,
  private vendorService: VendorService,
  private cdr: ChangeDetectorRef
) {}

  // ================= Dashboard Summary =================

  pendingCount = 0;

  approvedToday = 0;

  rejectedToday = 0;

  loading = false;

  errorMessage = '';

  // ================= Search & Filters =================

  searchText = '';

  selectedCategory = '';

  selectedApprovalStatus = '';

  // ================= Vendor Data =================
  // Retrieved from the FastAPI backend: GET /vendors/

  vendors: VendorApprovalModel[] = [];

  ngOnInit(): void {
    this.loadVendors();
  }

  private mapVendor(record: VendorRecord): VendorApprovalModel {
    return {
      id: record.id,
      vendorId: record.vendor_id,
      companyName: record.company_name,
      category: record.vendor_category,
      contactPerson: record.contact_person,
      email: record.email,
      phone: record.phone,
      vendorStatus: record.vendor_status,
      approvalStatus: record.approval_status,
      registeredDate: new Date(record.created_at).toLocaleDateString()
    };
  }

  loadVendors(): void {

    this.loading = true;
    this.errorMessage = '';

    this.vendorService.getVendors({ page: 1, size: 1000 }).subscribe({
      next: (response) => {
  this.vendors = response.items.map(item => this.mapVendor(item));
  this.updateSummary();
  this.loading = false;

  this.cdr.detectChanges();
},
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Failed to load vendors.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });

  }

  private updateSummary(): void {

    this.pendingCount = this.vendors.filter(
      v => v.approvalStatus === 'Pending'
    ).length;

    this.approvedToday = this.vendors.filter(
      v => v.approvalStatus === 'Approved'
    ).length;

    this.rejectedToday = this.vendors.filter(
      v => v.approvalStatus === 'Rejected'
    ).length;

  }

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

   this.router.navigate(['/vendor-details', vendor.id]);

  }

  // ================= Approve Vendor =================

  approveVendor(vendor: VendorApprovalModel): void {

    const confirmed = confirm(

      `Approve vendor "${vendor.companyName}"?`

    );

    if (!confirmed) {

      return;

    }

    this.vendorService.approveVendor(vendor.id).subscribe({
      next: (response) => {
        vendor.approvalStatus = response.approval_status;
        vendor.vendorStatus = response.vendor_status;
        this.updateSummary();
        this.cdr.detectChanges();
        alert(`${vendor.companyName} approved successfully.`);
      },
      error: (err) => {
        alert(err?.error?.detail || 'Failed to approve vendor.');
      }
    });

  }

  // ================= Reject Vendor =================

  rejectVendor(vendor: VendorApprovalModel): void {

    const confirmed = confirm(

      `Reject vendor "${vendor.companyName}"?`

    );

    if (!confirmed) {

      return;

    }

    this.vendorService.rejectVendor(vendor.id).subscribe({
      next: (response) => {
        vendor.approvalStatus = response.approval_status;
        vendor.vendorStatus = response.vendor_status;
        this.updateSummary();
        this.cdr.detectChanges();
        alert(`${vendor.companyName} rejected successfully.`);
      },
      error: (err) => {
        alert(err?.error?.detail || 'Failed to reject vendor.');
      }
    });

  }

}
