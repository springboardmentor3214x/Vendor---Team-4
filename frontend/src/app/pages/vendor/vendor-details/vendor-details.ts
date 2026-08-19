import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  VendorService,
  VendorRecord,
  VendorDocumentRecord
} from '../../../services/vendor.service';

interface VendorDetailsModel {
  id: number;
  vendorId: string;
  companyName: string;
  vendorCategory: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone: string;
  gstNumber: string;
  panNumber: string;
  registrationNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  website: string;
  description: string;
  accountNumber: string;
  ifscCode: string;
  paymentTerms: string;
  vendorStatus: string;
  approvalStatus: string;
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  approvedBy: string;
  approvedDate: string;
}

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

export class VendorDetails implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private cdr: ChangeDetectorRef
  ) {}

  loading = false;

  errorMessage = '';

  // Retrieved from the FastAPI backend: GET /vendors/{id}
  //
  // Note: the backend's VendorResponse schema currently only
  // exposes `created_at` for audit purposes -- createdBy,
  // lastUpdatedBy/Date, and approvedBy/Date are not returned
  // by the API yet, so they show as "Not available" below
  // until the backend schema is extended to include them.

  vendor: VendorDetailsModel = {
    id: 0,
    vendorId: '',
    companyName: '',
    vendorCategory: '',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    alternatePhone: '',
    gstNumber: '',
    panNumber: '',
    registrationNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    website: '',
    description: '',
    accountNumber: '',
    ifscCode: '',
    paymentTerms: '',
    vendorStatus: 'Pending',
    approvalStatus: 'Pending',
    createdBy: 'Not available',
    createdDate: '',
    lastUpdatedBy: 'Not available',
    lastUpdatedDate: 'Not available',
    approvedBy: 'Not available',
    approvedDate: 'Not available'
  };

  documents: VendorDocumentRecord[] = [];

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        this.loadVendor(id);
        this.loadDocuments(id);
      }
    });

  }

  private loadVendor(id: number): void {

    this.loading = true;
    this.errorMessage = '';

    this.vendorService.getVendorById(id).subscribe({
      next: (record) => this.mapVendor(record),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Failed to load vendor.';
        this.cdr.detectChanges();
      }
    });

  }

  private mapVendor(record: VendorRecord): void {

    this.vendor = {
      id: record.id,
      vendorId: record.vendor_id,
      companyName: record.company_name,
      vendorCategory: record.vendor_category,
      contactPerson: record.contact_person,
      designation: record.designation,
      email: record.email,
      phone: record.phone,
      alternatePhone: record.alternate_phone || '',
      gstNumber: record.gst_number,
      panNumber: record.pan_number,
      registrationNumber: record.company_registration_number,
      addressLine1: record.address_line1,
      addressLine2: record.address_line2 || '',
      city: record.city,
      state: record.state,
      country: record.country,
      pincode: record.pincode,
      website: record.website || '',
      description: record.description || '',
      accountNumber: record.bank_account_number || '',
      ifscCode: record.ifsc_code || '',
      paymentTerms: record.payment_terms || '',
      vendorStatus: record.vendor_status,
      approvalStatus: record.approval_status,
      createdBy: 'Not available',
      createdDate: new Date(record.created_at).toLocaleDateString(),
      lastUpdatedBy: 'Not available',
      lastUpdatedDate: 'Not available',
      approvedBy: 'Not available',
      approvedDate: 'Not available'
    };

    this.loading = false;
    this.cdr.detectChanges();

  }

  private loadDocuments(id: number): void {

    this.vendorService.getDocuments(id).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.cdr.detectChanges();
      },
      error: () => {
        this.documents = [];
        this.cdr.detectChanges();
      }
    });

  }

  // ================= Navigation =================

  back(): void {

    this.router.navigate(['/vendor-list']);

  }

  editVendor(): void {

    this.router.navigate(['/edit-vendor', this.vendor.id]);

  }

  // ================= Documents =================

  downloadDocument(document: VendorDocumentRecord): void {

    this.vendorService.downloadDocument(document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.file_name;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Failed to download document.');
      }
    });

  }

}