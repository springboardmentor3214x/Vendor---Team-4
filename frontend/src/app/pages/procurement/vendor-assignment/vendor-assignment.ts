import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-vendor-assignment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './vendor-assignment.html',
  styleUrl: './vendor-assignment.scss'
})
export class VendorAssignment {

  assignmentForm: any;

  selectedVendor: any = null;

  constructor(private fb: FormBuilder) {

    this.assignmentForm = this.fb.group({

      requestId: ['', Validators.required],

      vendor: ['', Validators.required],

      assignmentDate: ['', Validators.required],

      expectedDelivery: ['', Validators.required],

      remarks: ['']

    });

  }

  procurementRequests = [

    {
      id: 'PR-0001',
      title: 'Laptop Purchase'
    },

    {
      id: 'PR-0002',
      title: 'Office Chairs'
    },

    {
      id: 'PR-0003',
      title: 'Network Switch'
    }

  ];

  vendors = [

    {
      id: 'V001',
      name: 'ABC Technologies',
      category: 'IT Equipment',
      contactPerson: 'Rahul Sharma',
      reliabilityScore: 95,
      previousPerformance: 'Excellent',
      deliveryRating: 4.9,
      status: 'Active'
    },

    {
      id: 'V002',
      name: 'XYZ Suppliers',
      category: 'Office Furniture',
      contactPerson: 'Anita Das',
      reliabilityScore: 91,
      previousPerformance: 'Very Good',
      deliveryRating: 4.7,
      status: 'Active'
    },

    {
      id: 'V003',
      name: 'Global Office Solutions',
      category: 'Networking Equipment',
      contactPerson: 'Amit Roy',
      reliabilityScore: 88,
      previousPerformance: 'Good',
      deliveryRating: 4.5,
      status: 'Active'
    }

  ];

  onVendorChange(vendorId: string) {

    this.selectedVendor = this.vendors.find(

      vendor => vendor.id === vendorId

    );

  }

  assignVendor() {

    if (this.assignmentForm.invalid) {

      this.assignmentForm.markAllAsTouched();

      return;

    }

    console.log(this.assignmentForm.value);

    console.log('Assigned Vendor:', this.selectedVendor);

    alert('Vendor Assigned Successfully');

  }

  resetForm() {

    this.assignmentForm.reset();

    this.selectedVendor = null;

  }

}