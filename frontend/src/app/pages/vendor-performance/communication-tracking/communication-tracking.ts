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
  selector: 'app-communication-tracking',
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
  templateUrl: './communication-tracking.html',
  styleUrl: './communication-tracking.scss'
})
export class CommunicationTracking implements OnInit {

  constructor(private fb: FormBuilder) {}

  // ================= Purchase Order Information =================

  purchaseOrderNumber = 'PO-1001';

  vendorName = 'ABC Suppliers';

  procurementStatus = 'Completed';

  communicationType = 'Delivery Update';

  // ================= Communication Form =================

  communicationForm!: FormGroup;

  ngOnInit(): void {

    this.communicationForm = this.fb.group({

      messageSentTime: ['', Validators.required],

      vendorResponseTime: ['', Validators.required],

      responseDuration: [{ value: '', disabled: true }],

      communicationStatus: ['', Validators.required],

      remarks: ['']

    });

  }

  // ================= Table =================

  displayedColumns: string[] = [
    'purchaseOrder',
    'vendor',
    'sentTime',
    'responseTime',
    'duration',
    'status'
  ];

  communicationHistory = [

    {
      purchaseOrder: 'PO-1001',
      vendor: 'ABC Suppliers',
      sentTime: '21 Jul 2026 09:30',
      responseTime: '21 Jul 2026 10:05',
      duration: '35 Minutes',
      status: 'Responded'
    },

    {
      purchaseOrder: 'PO-1002',
      vendor: 'Global Tech',
      sentTime: '20 Jul 2026 11:15',
      responseTime: '20 Jul 2026 13:45',
      duration: '2 Hours 30 Minutes',
      status: 'Responded'
    },

    {
      purchaseOrder: 'PO-1003',
      vendor: 'Prime Industries',
      sentTime: '19 Jul 2026 14:00',
      responseTime: '--',
      duration: '--',
      status: 'Pending'
    }

  ];

  dataSource = new MatTableDataSource(this.communicationHistory);

  // ================= Submit =================

  onSubmit(): void {

    if (this.communicationForm.invalid) {
      return;
    }

    console.log(this.communicationForm.getRawValue());

    // Future FastAPI Integration
    // POST /communication-response

  }

  // ================= Reset =================

  resetForm(): void {

    this.communicationForm.reset();

  }

  // ================= Search =================

  applyFilter(event: Event): void {

    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

}