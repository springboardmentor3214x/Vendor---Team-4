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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-delivery-performance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './delivery-performance.html',
  styleUrl: './delivery-performance.scss'
})
export class DeliveryPerformance implements OnInit {

  constructor(private fb: FormBuilder) {}

  // ================= Purchase Order Details =================

  purchaseOrderNumber = 'PO-1001';

  vendorName = 'ABC Suppliers';

  expectedDeliveryDate = '20 Jul 2026';

  purchaseOrderStatus = 'Pending';

  // ================= Reactive Form =================

  deliveryForm!: FormGroup;

  ngOnInit(): void {

    this.deliveryForm = this.fb.group({

      actualDeliveryDate: ['', Validators.required],

      delay: [{ value: '', disabled: true }],

      deliveryStatus: [{ value: '', disabled: true }],

      remarks: ['']

    });

  }

  // ================= Table =================

  displayedColumns: string[] = [
    'purchaseOrder',
    'vendor',
    'expectedDate',
    'actualDate',
    'delay',
    'status',
    'remarks'
  ];

  deliveryHistory = [
    {
      purchaseOrder: 'PO-1001',
      vendor: 'ABC Suppliers',
      expectedDate: '20 Jul 2026',
      actualDate: '20 Jul 2026',
      delay: 0,
      status: 'On-Time Delivery',
      remarks: 'Delivered as scheduled'
    },
    {
      purchaseOrder: 'PO-1002',
      vendor: 'Global Tech',
      expectedDate: '18 Jul 2026',
      actualDate: '21 Jul 2026',
      delay: 3,
      status: 'Delayed Delivery',
      remarks: 'Transport delay'
    },
    {
      purchaseOrder: 'PO-1003',
      vendor: 'Prime Industries',
      expectedDate: '25 Jul 2026',
      actualDate: '24 Jul 2026',
      delay: -1,
      status: 'Early Delivery',
      remarks: 'Delivered earlier than expected'
    }
  ];

  dataSource = new MatTableDataSource(this.deliveryHistory);

  // ================= Submit =================

  onSubmit(): void {

    if (this.deliveryForm.invalid) {
      return;
    }

    console.log(this.deliveryForm.getRawValue());

    // Backend Integration (Later)
    // POST /delivery-performance

  }

  // ================= Reset =================

  resetForm(): void {

    this.deliveryForm.reset();

  }

  // ================= Search =================

  applyFilter(event: Event): void {

    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

}