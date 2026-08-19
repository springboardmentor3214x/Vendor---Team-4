import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-vendor-assignment',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatCardModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './vendor-assignment.html',
  styleUrl: './vendor-assignment.scss'
})
export class VendorAssignment implements OnInit {

  assignmentForm: any;
  selectedVendor: any = null;
  procurementRequests: any[] = [];
  vendors: any[] = [];
  loading = true;

  constructor(
    private fb: FormBuilder,
    private procurementService: ProcurementService
  ) {
    this.assignmentForm = this.fb.group({
      requestId: ['', Validators.required],
      vendor: ['', Validators.required],
      assignmentDate: [new Date(), Validators.required],
      expectedDelivery: ['', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.procurementService.getRequests({ page: 1, size: 1000 }).subscribe({
      next: (response) => {
        this.procurementRequests = (response?.items || [])
          .filter((item: any) => item.request_status === 'Approved' && !item.vendor_id)
          .map((item: any) => ({
            backendId: item.id,
            id: item.request_number,
            title: item.request_title,
            expectedDelivery: item.required_delivery_date
          }));
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        alert(error?.error?.detail || 'Failed to load procurement requests.');
      }
    });

    this.procurementService.getApprovedVendors().subscribe({
      next: (vendors) => {
        this.vendors = vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.company_name,
          category: vendor.vendor_category,
          contactPerson: vendor.contact_person,
          email: vendor.email,
          phone: vendor.phone,
          reliabilityScore: null,
          previousPerformance: 'Available vendor data',
          deliveryRating: null,
          status: vendor.vendor_status
        }));
      },
      error: (error) => alert(error?.error?.detail || 'Failed to load approved vendors.')
    });
  }

  onRequestChange(requestNumber: string): void {
    const request = this.procurementRequests.find(item => item.id === requestNumber);
    if (!request) return;

    this.assignmentForm.patchValue({
      expectedDelivery: request.expectedDelivery
    });
  }

  onVendorChange(vendorId: number): void {
    this.selectedVendor = this.vendors.find(vendor => vendor.id === Number(vendorId)) || null;
  }

  assignVendor(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const form = this.assignmentForm.value;
    const request = this.procurementRequests.find(item => item.id === form.requestId);

    if (!request) {
      alert('Selected procurement request could not be found.');
      return;
    }

    this.procurementService.assignVendor(request.backendId, Number(form.vendor)).subscribe({
      next: (response) => {
        alert(response?.message || 'Vendor assigned successfully.');
        this.assignmentForm.reset({ assignmentDate: new Date() });
        this.selectedVendor = null;
        this.loadData();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to assign vendor.')
    });
  }

  resetForm(): void {
    this.assignmentForm.reset({ assignmentDate: new Date() });
    this.selectedVendor = null;
  }
}
