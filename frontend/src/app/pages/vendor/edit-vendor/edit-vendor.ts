import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-edit-vendor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './edit-vendor.html',
  styleUrl: './edit-vendor.scss'
})

export class EditVendor implements OnInit {

  vendorForm!: FormGroup;

  uploadedFiles: File[] = [];

  readonly maxFileSize = 5 * 1024 * 1024;

  readonly allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  constructor(

    private fb: FormBuilder,

    private router: Router

  ) {}

  ngOnInit(): void {

    this.vendorForm = this.fb.group({

      // ================= Company Information =================

      companyName: [
        'ABC Technologies',
        Validators.required
      ],

      vendorCategory: [
        'IT Vendors',
        Validators.required
      ],

      contactPerson: [
        'John Smith',
        Validators.required
      ],

      designation: [
        'Sales Manager',
        Validators.required
      ],

      // ================= Contact Information =================

      email: [
        'abc@gmail.com',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '9876543210',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      alternatePhone: [
        '9876543211'
      ],

      // ================= Company Details =================

      gstNumber: [
        '22ABCDE1234F1Z5',
        Validators.required
      ],

      panNumber: [
        'ABCDE1234F',
        Validators.required
      ],

      registrationNumber: [
        'REG987654',
        Validators.required
      ],

      // ================= Address =================

      addressLine1: [
        'Sector 5',
        Validators.required
      ],

      addressLine2: [
        'Salt Lake'
      ],

      city: [
        'Kolkata',
        Validators.required
      ],

      state: [
        'West Bengal',
        Validators.required
      ],

      country: [
        'India',
        Validators.required
      ],

      pincode: [
        '700091',
        [
          Validators.required,
          Validators.pattern('^[0-9]{6}$')
        ]
      ],

      // ================= Other Information =================

      website: [
        'https://www.abctech.com'
      ],

      description: [
        'IT Service Provider'
      ],

      // ================= Bank Details =================

      accountNumber: [
        '123456789012',
        Validators.required
      ],

      ifscCode: [
        'SBIN0001234',
        Validators.required
      ],

      paymentTerms: [
        '30 Days',
        Validators.required
      ],

      // ================= Status =================

      vendorStatus: [
        'Active',
        Validators.required
      ],

      approvalStatus: [
        'Approved'
      ]

    });

    // Existing uploaded documents (sample data)
    // These would normally come from the FastAPI backend.

    this.uploadedFiles = [];

  }
    // ================= File Upload =================

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    for (const file of Array.from(input.files)) {

      // ---------- File Type Validation ----------

      if (!this.allowedFileTypes.includes(file.type)) {

        alert(
          `${file.name} is not a supported file type.\n\nAllowed formats: PDF, JPG, JPEG, PNG.`
        );

        continue;

      }

      // ---------- File Size Validation ----------

      if (file.size > this.maxFileSize) {

        alert(
          `${file.name} exceeds the maximum file size of 5 MB.`
        );

        continue;

      }

      // ---------- Duplicate File Validation ----------

      const alreadyExists = this.uploadedFiles.some(existing =>

        existing.name === file.name &&
        existing.size === file.size

      );

      if (alreadyExists) {

        alert(`${file.name} has already been selected.`);

        continue;

      }

      this.uploadedFiles.push(file);

    }

    // Reset file input

    input.value = '';

  }

  // ================= Remove File =================

  removeFile(index: number): void {

    this.uploadedFiles.splice(index, 1);

  }

  // ================= Update Vendor =================

  updateVendor(): void {

    if (this.vendorForm.invalid) {

      this.vendorForm.markAllAsTouched();

      return;

    }

    console.log('Updated Vendor Information');

    console.log(this.vendorForm.value);

    console.log('Vendor Documents');

    console.log(this.uploadedFiles);

    /*
    ============================================================
    FastAPI Integration
    ============================================================

    Endpoint

    PUT /api/vendors/{vendorId}

    Request

    Multipart/Form-Data

    ============================================================
    Backend Responsibilities
    ============================================================

    Validate Company Name uniqueness
    (excluding the current vendor)

    Validate Email uniqueness

    Validate GST Number uniqueness

    Validate PAN Number uniqueness

    Validate Company Registration Number uniqueness

    Validate uploaded documents

    Replace or store new documents

    Update vendor information

    Update audit information

    lastUpdatedBy

    lastUpdatedDate

    ============================================================
    Approval Workflow
    ============================================================

    Approval Status is managed separately
    through the Vendor Approval Workflow.

    This page should not approve or reject vendors.

    ============================================================
    Procurement Integration
    ============================================================

    Vendor will be available for Procurement only when

    approvalStatus == Approved

    AND

    vendorStatus == Active

    ============================================================
    Future Module Integration
    ============================================================

    Purchase Orders

    Procurement Records

    Vendor Performance

    Vendor Reliability

    Reports

    Contracts

    All reference this Vendor record.

    ============================================================

    */

    alert('Vendor updated successfully.');

  }

  // ================= Cancel =================

  cancel(): void {

    this.router.navigate(['/vendor-list']);

  }

}