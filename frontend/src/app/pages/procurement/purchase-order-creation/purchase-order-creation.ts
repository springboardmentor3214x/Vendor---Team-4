import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-purchase-order-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './purchase-order-creation.html',
  styleUrl: './purchase-order-creation.scss'
})
export class PurchaseOrderCreation {

  purchaseOrderForm: any;

  procurementRequests = [
    'PR-0001',
    'PR-0002',
    'PR-0003'
  ];

  vendors = [
    'ABC Technologies',
    'XYZ Suppliers',
    'Global Office Solutions'
  ];

  constructor(private fb: FormBuilder) {

    this.purchaseOrderForm = this.fb.group({

      purchaseOrderNumber: ['PO-0001'],

      procurementRequest: ['', Validators.required],

      vendor: ['', Validators.required],

      vendorAddress: ['', Validators.required],

      contactPerson: ['', Validators.required],

      productDetails: ['', Validators.required],

      quantity: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      unitPrice: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      totalCost: [
        '',
        Validators.required
      ],

      taxDetails: ['', Validators.required],

      shippingAddress: ['', Validators.required],

      expectedDelivery: ['', Validators.required],

      paymentTerms: ['', Validators.required],

      status: ['Generated', Validators.required],

      approvedBy: ['', Validators.required],

      orderDate: ['', Validators.required],

      remarks: ['']

    });

  }

  createPurchaseOrder() {

    if (this.purchaseOrderForm.invalid) {

      this.purchaseOrderForm.markAllAsTouched();

      return;

    }

    console.log(this.purchaseOrderForm.value);

    alert('Purchase Order Generated Successfully');

  }

  savePurchaseOrder() {

    console.log('Draft Saved');

    alert('Purchase Order Saved');

  }

  cancelPurchaseOrder() {

    if (confirm('Cancel Purchase Order?')) {

      this.purchaseOrderForm.reset();

      this.purchaseOrderForm.patchValue({

        purchaseOrderNumber: 'PO-0001',

        status: 'Generated'

      });

    }

  }

}