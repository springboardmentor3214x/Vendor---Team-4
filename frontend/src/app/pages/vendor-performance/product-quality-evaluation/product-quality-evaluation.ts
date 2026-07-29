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
  selector: 'app-product-quality-evaluation',
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
  templateUrl: './product-quality-evaluation.html',
  styleUrl: './product-quality-evaluation.scss'
})
export class ProductQualityEvaluation implements OnInit {

  constructor(private fb: FormBuilder) {}

  // ================= Purchase Order Information =================

  purchaseOrderNumber = 'PO-1001';

  vendorName = 'ABC Suppliers';

  inspectionDate = '21 Jul 2026';

  deliveryStatus = 'Completed';

  // ================= Rating Options =================

  ratings = [
    '★★★★★ (5)',
    '★★★★☆ (4)',
    '★★★☆☆ (3)',
    '★★☆☆☆ (2)',
    '★☆☆☆☆ (1)'
  ];

  // ================= Reactive Form =================

  qualityForm!: FormGroup;

  ngOnInit(): void {

    this.qualityForm = this.fb.group({

      materialQuality: ['', Validators.required],

      packagingQuality: ['', Validators.required],

      quantityAccuracy: ['', Validators.required],

      specificationCompliance: ['', Validators.required],

      productDefects: [''],

      overallRating: ['', Validators.required],

      inspectorRemarks: ['']

    });

  }

  // ================= Table =================

  displayedColumns: string[] = [
    'purchaseOrder',
    'vendor',
    'inspectionDate',
    'overallRating',
    'inspector',
    'status'
  ];

  qualityHistory = [

    {
      purchaseOrder: 'PO-1001',
      vendor: 'ABC Suppliers',
      inspectionDate: '21 Jul 2026',
      overallRating: 'Excellent',
      inspector: 'John Smith',
      status: 'Completed'
    },

    {
      purchaseOrder: 'PO-1002',
      vendor: 'Global Tech',
      inspectionDate: '20 Jul 2026',
      overallRating: 'Good',
      inspector: 'Emily Davis',
      status: 'Completed'
    },

    {
      purchaseOrder: 'PO-1003',
      vendor: 'Prime Industries',
      inspectionDate: '19 Jul 2026',
      overallRating: 'Average',
      inspector: 'Michael Brown',
      status: 'Completed'
    }

  ];

  dataSource = new MatTableDataSource(this.qualityHistory);

  // ================= Submit =================

  onSubmit(): void {

    if (this.qualityForm.invalid) {
      return;
    }

    console.log(this.qualityForm.value);

    // Future FastAPI Integration
    // POST /product-quality-evaluation

  }

  // ================= Reset =================

  resetForm(): void {

    this.qualityForm.reset();

  }

  // ================= Search =================

  applyFilter(event: Event): void {

    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

}