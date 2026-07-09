import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ],
  templateUrl: './edit-vendor.html',
  styleUrl: './edit-vendor.scss'
})
export class EditVendor {

  vendorForm: any;

  uploadedFiles = [
    'GST Certificate.pdf',
    'PAN Card.pdf',
    'Registration Certificate.pdf'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.vendorForm = this.fb.group({

      companyName: ['ABC Technologies', Validators.required],

      vendorCategory: ['IT', Validators.required],

      contactPerson: ['John Smith', Validators.required],

      designation: ['Sales Manager', Validators.required],

      email: [
        'abc@gmail.com',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '9876543210',
        Validators.required
      ],

      alternatePhone: ['9876543211'],

      gstNumber: ['22ABCDE1234F1Z5', Validators.required],

      panNumber: ['ABCDE1234F', Validators.required],

      registrationNumber: ['REG987654', Validators.required],

      addressLine1: ['Sector 5', Validators.required],

      addressLine2: ['Salt Lake'],

      city: ['Kolkata', Validators.required],

      state: ['West Bengal', Validators.required],

      country: ['India', Validators.required],

      pincode: ['700091', Validators.required],

      website: ['www.abctech.com'],

      description: ['IT Service Provider'],

      accountNumber: ['123456789012', Validators.required],

      ifscCode: ['SBIN0001234', Validators.required],

      paymentTerms: ['30 Days', Validators.required],

      vendorStatus: ['Active', Validators.required]

    });

  }

  onFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files) {

      for (let i = 0; i < input.files.length; i++) {

        this.uploadedFiles.push(input.files[i].name);

      }

    }

  }

  removeFile(index: number) {

    this.uploadedFiles.splice(index, 1);

  }

  updateVendor() {

    if (this.vendorForm.invalid) {

      this.vendorForm.markAllAsTouched();

      return;

    }

    console.log(this.vendorForm.value);

    alert('Vendor updated successfully.');

  }

  cancel() {

    this.router.navigate(['/vendor-list']);

  }

}