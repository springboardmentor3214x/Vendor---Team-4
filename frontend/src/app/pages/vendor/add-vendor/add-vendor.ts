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
  selector: 'app-add-vendor',
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
  templateUrl: './add-vendor.html',
  styleUrl: './add-vendor.scss'
})
export class AddVendor {

  vendorForm: any;

  uploadedFiles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.vendorForm = this.fb.group({

      // Company Information

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

      // Contact Details

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

      // Company Details

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

      // Address

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

      // Other Details

      website: [''],

      description: [''],

      // Banking

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

      vendorStatus: [
        'Pending',
        Validators.required
      ]

    });

  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files) {

      for (let i = 0; i < input.files.length; i++) {

        this.uploadedFiles.push(input.files[i].name);

      }

    }

  }

  removeFile(index: number): void {

    this.uploadedFiles.splice(index, 1);

  }

  onSubmit(): void {

    if (this.vendorForm.invalid) {

      this.vendorForm.markAllAsTouched();

      return;

    }

    console.log(this.vendorForm.value);

    console.log(this.uploadedFiles);

    /*
      FastAPI Integration

      POST /api/vendors

      Form Data +
      Uploaded Documents
    */

    alert('Vendor added successfully!');

  }

  cancel(): void {

    this.router.navigate(['/vendor-list']);

  }

}