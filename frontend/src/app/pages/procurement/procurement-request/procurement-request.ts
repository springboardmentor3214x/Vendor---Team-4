import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ProcurementService } from '../../../services/procurement.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-procurement-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterLink
  ],
  templateUrl: './procurement-request.html',
  styleUrl: './procurement-request.scss'
})
export class ProcurementRequest implements OnInit {

  procurementForm: any;
  uploadedFiles: File[] = [];
  mode: 'create' | 'view' | 'edit' = 'create';
  requestId = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private procurementService: ProcurementService,
    private authService: AuthService
  ) {
    this.procurementForm = this.fb.group({
      requestNumber: [''],
      requestTitle: ['', Validators.required],
      departmentName: ['', Validators.required],
      requestedBy: ['', Validators.required],
      productName: ['', Validators.required],
      productCategory: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      estimatedBudget: ['', [Validators.required, Validators.min(0.01)]],
      requiredDeliveryDate: ['', Validators.required],
      priority: ['Medium', Validators.required],
      businessJustification: ['', Validators.required],
      additionalRemarks: [''],
      requestStatus: ['Pending']
    });
  }

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    const url = this.router.url;

    if (url.includes('/view/')) {
      this.mode = 'view';
    } else if (url.includes('/edit/')) {
      this.mode = 'edit';
    } else {
      this.mode = 'create';
    }

    if (this.requestId) {
      this.loadRequest(Number(this.requestId));
    } else {
      this.loadCurrentUser();
    }
  }

  private loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.procurementForm.patchValue({
          requestedBy: user?.full_name || user?.email || ''
        });
      },
      error: () => {
        // Keep the field editable if the current-user endpoint is unavailable.
      }
    });
  }

  private loadRequest(id: number): void {
    this.loading = true;
    this.procurementService.getRequest(id).subscribe({
      next: (item) => {
        this.procurementForm.patchValue({
          requestNumber: item.request_number,
          requestTitle: item.request_title,
          departmentName: item.department_name,
          requestedBy: String(item.requested_by),
          productName: item.item_name,
          productCategory: item.product_category,
          quantity: item.quantity,
          unit: item.unit,
          estimatedBudget: item.estimated_budget,
          requiredDeliveryDate: item.required_delivery_date,
          priority: item.priority,
          businessJustification: item.business_justification,
          additionalRemarks: item.additional_remarks || '',
          requestStatus: item.request_status
        });

        this.loading = false;

        if (this.mode === 'view') {
          this.procurementForm.disable();
        }
      },
      error: (error) => {
        this.loading = false;
        alert(error?.error?.detail || 'Failed to load procurement request.');
        this.router.navigate(['/procurement-request-list']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.uploadedFiles.push(input.files[i]);
      }
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  private buildRequestData(formValue: any, status?: string): any {
    return {
      request_title: formValue.requestTitle,
      department_name: formValue.departmentName,
      item_name: formValue.productName,
      product_category: formValue.productCategory,
      quantity: Number(formValue.quantity),
      unit: formValue.unit,
      estimated_budget: Number(formValue.estimatedBudget),
      required_delivery_date: formValue.requiredDeliveryDate
        ? new Date(formValue.requiredDeliveryDate).toISOString().split('T')[0]
        : '',
      priority: formValue.priority,
      business_justification: formValue.businessJustification,
      additional_remarks: formValue.additionalRemarks || '',
      supporting_document: '',
      ...(status ? { request_status: status } : {})
    };
  }

  saveDraft(): void {
    if (this.mode !== 'create') return;

    if (this.procurementForm.invalid) {
      this.procurementForm.markAllAsTouched();
      return;
    }

    this.submitCreate('Draft', 'Procurement draft saved successfully.');
  }

  onSubmit(): void {
    if (this.procurementForm.invalid) {
      this.procurementForm.markAllAsTouched();
      return;
    }

    if (this.mode === 'edit' && this.requestId) {
      const data = this.buildRequestData(this.procurementForm.getRawValue());
      this.loading = true;
      this.procurementService.updateRequest(Number(this.requestId), data).subscribe({
        next: () => {
          this.loading = false;
          alert('Procurement Request updated successfully.');
          this.router.navigate(['/procurement-request-list']);
        },
        error: (error) => {
          this.loading = false;
          alert(this.getErrorMessage(error, 'Failed to update procurement request.'));
        }
      });
      return;
    }

    this.submitCreate('Pending', 'Procurement Request Submitted Successfully!');
  }

  private submitCreate(status: string, successMessage: string): void {
    const formValue = this.procurementForm.getRawValue();
    const requestData = this.buildRequestData(formValue, status);

    this.loading = true;
    this.procurementService.createRequest(requestData).subscribe({
      next: () => {
        this.loading = false;
        alert(successMessage);
        this.router.navigate(['/procurement-request-list']);
      },
      error: (error) => {
        this.loading = false;
        alert(this.getErrorMessage(error, 'Failed to create procurement request.'));
      }
    });
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (typeof error?.error === 'string') return error.error;
    if (typeof error?.error?.detail === 'string') return error.error.detail;
    if (Array.isArray(error?.error?.detail)) {
      return error.error.detail.map((item: any) => item.msg || JSON.stringify(item)).join('\n');
    }
    return error?.message || fallback;
  }

  cancel(): void {
    this.router.navigate(['/procurement-request-list']);
  }
}
