import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
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

import { VendorService } from '../../../services/vendor.service';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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

  selectedDocumentType = 'Other';

  readonly maxFileSize = 5 * 1024 * 1024;

  readonly allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  submitting = false;

  errorMessage = '';

  constructor(

    private fb: FormBuilder,

    private router: Router,

    private vendorService: VendorService

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
      ]

      // Vendor Status / Approval Status are system managed
      // and assigned by the backend (Pending on creation).

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

    this.submitting = true;
    this.errorMessage = '';

    const formValue = this.vendorForm.value;

    const payload = {
      company_name: formValue.companyName,
      vendor_category: formValue.vendorCategory,
      contact_person: formValue.contactPerson,
      designation: formValue.designation,
      email: formValue.email,
      phone: formValue.phone,
      alternate_phone: formValue.alternatePhone || null,
      gst_number: formValue.gstNumber,
      pan_number: formValue.panNumber,
      company_registration_number: formValue.registrationNumber,
      address_line1: formValue.addressLine1,
      address_line2: formValue.addressLine2 || null,
      city: formValue.city,
      state: formValue.state,
      country: formValue.country,
      pincode: formValue.pincode,
      website: formValue.website || null,
      description: formValue.description || null,
      bank_account_number: formValue.accountNumber || null,
      ifsc_code: formValue.ifscCode || null,
      payment_terms: formValue.paymentTerms || null
    };

    this.vendorService.createVendor(payload).subscribe({
      next: (vendor) => {
        this.uploadDocumentsThenFinish(vendor.id);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.detail || 'Failed to register vendor.';
      }
    });

  }

  // ================= Upload Documents =================

  private uploadDocumentsThenFinish(vendorId: number): void {

    if (this.uploadedFiles.length === 0) {
      this.finishSubmit();
      return;
    }

    let remaining = this.uploadedFiles.length;

    this.uploadedFiles.forEach(file => {

      this.vendorService.uploadDocument(vendorId, this.selectedDocumentType, file).subscribe({
        next: () => {
          remaining -= 1;
          if (remaining === 0) {
            this.finishSubmit();
          }
        },
        error: () => {
          remaining -= 1;
          if (remaining === 0) {
            this.finishSubmit();
          }
        }
      });

    });

  }

  private finishSubmit(): void {
    this.submitting = false;
    alert('Vendor registered successfully and sent for approval.');
    this.router.navigate(['/vendor-list']);
  }

  // ================= Cancel =================

  cancel(): void {

    this.router.navigate(['/vendor-list']);

  }

}
