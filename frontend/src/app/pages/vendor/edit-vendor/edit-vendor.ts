import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { VendorService, VendorRecord } from '../../../services/vendor.service';

@Component({
  selector: 'app-edit-vendor',
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
    MatCardModule
  ],
  templateUrl: './edit-vendor.html',
  styleUrl: './edit-vendor.scss'
})

export class EditVendor implements OnInit {

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

  vendorId!: number;

  // Read-only -- approval is managed via the Vendor Approval workflow,
  // not through this form.
  approvalStatus = 'Pending';

  loading = false;

  submitting = false;

  errorMessage = '';

  constructor(

    private fb: FormBuilder,

    private router: Router,

    private route: ActivatedRoute,

    private vendorService: VendorService

  ) {}

  ngOnInit(): void {

    this.vendorForm = this.fb.group({

      // ================= Company Information =================

      companyName: ['', Validators.required],

      vendorCategory: ['', Validators.required],

      contactPerson: ['', Validators.required],

      designation: ['', Validators.required],

      // ================= Contact Information =================

      email: ['', [Validators.required, Validators.email]],

      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

      alternatePhone: [''],

      // ================= Company Details =================

      gstNumber: ['', Validators.required],

      panNumber: ['', Validators.required],

      registrationNumber: ['', Validators.required],

      // ================= Address =================

      addressLine1: ['', Validators.required],

      addressLine2: [''],

      city: ['', Validators.required],

      state: ['', Validators.required],

      country: ['', Validators.required],

      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],

      // ================= Other Information =================

      website: [''],

      description: [''],

      // ================= Bank Details =================

      accountNumber: ['', Validators.required],

      ifscCode: ['', Validators.required],

      paymentTerms: ['', Validators.required],

      // ================= Status =================
      // Vendor Status can be adjusted here; Approval Status is
      // managed separately through the Vendor Approval workflow.

      vendorStatus: ['Pending', Validators.required]

    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.vendorId = Number(idParam);
        this.loadVendor();
      }
    });

  }

  // ================= Load Vendor =================

  private loadVendor(): void {

    this.loading = true;
    this.errorMessage = '';

    this.vendorService.getVendorById(this.vendorId).subscribe({
      next: (vendor) => this.populateForm(vendor),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Failed to load vendor.';
      }
    });

  }

  private populateForm(vendor: VendorRecord): void {

    this.vendorForm.patchValue({
      companyName: vendor.company_name,
      vendorCategory: vendor.vendor_category,
      contactPerson: vendor.contact_person,
      designation: vendor.designation,
      email: vendor.email,
      phone: vendor.phone,
      alternatePhone: vendor.alternate_phone || '',
      gstNumber: vendor.gst_number,
      panNumber: vendor.pan_number,
      registrationNumber: vendor.company_registration_number,
      addressLine1: vendor.address_line1,
      addressLine2: vendor.address_line2 || '',
      city: vendor.city,
      state: vendor.state,
      country: vendor.country,
      pincode: vendor.pincode,
      website: vendor.website || '',
      description: vendor.description || '',
      accountNumber: vendor.bank_account_number || '',
      ifscCode: vendor.ifsc_code || '',
      paymentTerms: vendor.payment_terms || '',
      vendorStatus: vendor.vendor_status
    });

    this.approvalStatus = vendor.approval_status;

    this.loading = false;

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
      payment_terms: formValue.paymentTerms || null,
      vendor_status: formValue.vendorStatus
    };

    this.vendorService.updateVendor(this.vendorId, payload).subscribe({
      next: () => {
        this.uploadDocumentsThenFinish();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.detail || 'Failed to update vendor.';
      }
    });

  }

  private uploadDocumentsThenFinish(): void {

    if (this.uploadedFiles.length === 0) {
      this.finishSubmit();
      return;
    }

    let remaining = this.uploadedFiles.length;

    this.uploadedFiles.forEach(file => {

      this.vendorService.uploadDocument(this.vendorId, this.selectedDocumentType, file).subscribe({
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
    alert('Vendor updated successfully.');
    this.router.navigate(['/vendor-list']);
  }

  // ================= Cancel =================

  cancel(): void {

    this.router.navigate(['/vendor-list']);

  }

}
