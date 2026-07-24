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
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './add-vendor.html',
  styleUrl: './add-vendor.scss'
})
export class AddVendor implements OnInit {

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
        '',
        Validators.required
      ],

      vendorCategory: [
        '',
        Validators.required
      ],

      contactPerson: [
        '',
        Validators.required
      ],

      designation: [
        '',
        Validators.required
      ],

      // ================= Contact Information =================

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      alternatePhone: [''],

      // ================= Company Details =================

      gstNumber: [
        '',
        Validators.required
      ],

      panNumber: [
        '',
        Validators.required
      ],

      registrationNumber: [
        '',
        Validators.required
      ],

      // ================= Address =================

      addressLine1: [
        '',
        Validators.required
      ],

      addressLine2: [''],

      city: [
        '',
        Validators.required
      ],

      state: [
        '',
        Validators.required
      ],

      country: [
        '',
        Validators.required
      ],

      pincode: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{6}$')
        ]
      ],

      // ================= Other Information =================

      website: [''],

      description: [''],

      // ================= Bank Details =================

      accountNumber: [
        '',
        Validators.required
      ],

      ifscCode: [
        '',
        Validators.required
      ],

      paymentTerms: [
        '',
        Validators.required
      ],

      // ================= System Managed Fields =================

      // Automatically assigned during registration.
      // Users cannot modify these values.

      vendorStatus: [
        'Pending'
      ],

      approvalStatus: [
        'Pending'
      ]

    });

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

    // Reset input so the same file can be selected again after removal

    input.value = '';

  }

  // ================= Remove Uploaded File =================

  removeFile(index: number): void {

    this.uploadedFiles.splice(index, 1);

  }

  // ================= Save Vendor =================

  onSubmit(): void {

    if (this.vendorForm.invalid) {

      this.vendorForm.markAllAsTouched();

      return;

    }

    console.log('Vendor Information');

    console.log(this.vendorForm.value);

    console.log('Uploaded Documents');

    console.log(this.uploadedFiles);

    /*
    ============================================================
    FastAPI Integration
    ============================================================

    Endpoint

    POST /api/vendors

    Request

    Multipart/Form-Data

    ----------------------------
    Form Fields
    ----------------------------

    Company Information

    Contact Information

    Address

    Banking Information

    Vendor Category

    Payment Terms

    Vendor Documents

    ----------------------------
    System Managed Fields
    ----------------------------

    approvalStatus = Pending

    vendorStatus = Pending

    ----------------------------
    Backend Responsibilities
    ----------------------------

    Validate duplicate Company Name (business rule)

    Validate Email uniqueness

    Validate GST uniqueness

    Validate PAN uniqueness

    Validate Registration Number uniqueness

    Validate uploaded documents

    Store files

    Store vendor information

    Generate Vendor ID

    Generate audit fields

    createdBy

    createdDate

    lastUpdatedBy

    lastUpdatedDate

    approvedBy

    approvedDate

    ============================================================
    Procurement Integration
    ============================================================

    Vendor will NOT appear in Procurement until

    approvalStatus == Approved

    AND

    vendorStatus == Active

    ============================================================

    */

    alert('Vendor registered successfully and sent for approval.');

  }

  // ================= Cancel =================

  cancel(): void {

    this.router.navigate(['/vendor-list']);

  }

}