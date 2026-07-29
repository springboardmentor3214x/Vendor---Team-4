import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-service-rating',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './service-rating.html',
  styleUrl: './service-rating.scss'
})
export class ServiceRating implements OnInit {

  constructor(private fb: FormBuilder) {}

  // ================= Purchase Order Information =================

  purchaseOrderNumber = 'PO-1001';

  vendorName = 'ABC Suppliers';

  procurementStatus = 'Completed';

  completionDate = '21 Jul 2026';

  // ================= Rating Options =================

  ratings = [
    '★★★★★ (5)',
    '★★★★☆ (4)',
    '★★★☆☆ (3)',
    '★★☆☆☆ (2)',
    '★☆☆☆☆ (1)'
  ];

  // ================= Reactive Form =================

  serviceRatingForm!: FormGroup;

  ngOnInit(): void {

    this.serviceRatingForm = this.fb.group({

      professionalism: ['', Validators.required],

      customerSupport: ['', Validators.required],

      documentationQuality: ['', Validators.required],

      flexibility: ['', Validators.required],

      communicationEffectiveness: ['', Validators.required],

      issueResolution: ['', Validators.required],

      overallServiceRating: ['', Validators.required],

      comments: ['']

    });

  }

  // ================= Table =================

  displayedColumns: string[] = [
    'purchaseOrder',
    'vendor',
    'overallRating',
    'reviewedBy',
    'date'
  ];

  serviceRatingHistory = [

    {
      purchaseOrder: 'PO-1001',
      vendor: 'ABC Suppliers',
      overallRating: 'Excellent',
      reviewedBy: 'John Smith',
      date: '21 Jul 2026'
    },

    {
      purchaseOrder: 'PO-1002',
      vendor: 'Global Tech',
      overallRating: 'Good',
      reviewedBy: 'Emily Davis',
      date: '20 Jul 2026'
    },

    {
      purchaseOrder: 'PO-1003',
      vendor: 'Prime Industries',
      overallRating: 'Average',
      reviewedBy: 'Michael Brown',
      date: '19 Jul 2026'
    }

  ];

  dataSource = new MatTableDataSource(this.serviceRatingHistory);

  // ================= Submit =================

  onSubmit(): void {

    if (this.serviceRatingForm.invalid) {
      return;
    }

    console.log(this.serviceRatingForm.getRawValue());

    // Future FastAPI Integration
    // POST /service-rating

  }

  // ================= Reset =================

  resetForm(): void {

    this.serviceRatingForm.reset();

  }

  // ================= Search =================

  applyFilter(event: Event): void {

    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

}