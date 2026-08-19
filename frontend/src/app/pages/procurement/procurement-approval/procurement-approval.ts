import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProcurementService } from '../../../services/procurement.service';

@Component({
  selector: 'app-procurement-approval',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule
  ],
  templateUrl: './procurement-approval.html',
  styleUrl: './procurement-approval.scss'
})
export class ProcurementApproval implements OnInit {

  constructor(private procurementService: ProcurementService) {}

  searchText = '';
  statusFilter = 'All';
  selectedRequest: any = null;
  requests: any[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.procurementService.getRequests({ page: 1, size: 1000 }).subscribe({
      next: (response) => {
        this.requests = (response?.items || []).map((item: any) => ({
          backendId: item.id,
          requestId: item.request_number,
          title: item.request_title,
          department: item.department_name,
          requestedBy: String(item.requested_by),
          product: item.item_name,
          category: item.product_category,
          quantity: item.quantity,
          unit: item.unit,
          budget: item.estimated_budget,
          deliveryDate: item.required_delivery_date,
          priority: item.priority,
          justification: item.business_justification,
          additionalRemarks: item.additional_remarks || '',
          status: item.request_status,
          approvedBy: item.approved_by ? String(item.approved_by) : '',
          approvalDate: item.approved_at ? new Date(item.approved_at).toLocaleString('en-GB') : '',
          remarks: item.approval_remarks || ''
        }));
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        alert(error?.error?.detail || 'Failed to load procurement requests.');
      }
    });
  }

  get filteredRequests(): any[] {
    const search = this.searchText.trim().toLowerCase();
    return this.requests.filter(request => {
      const matchesSearch = !search ||
        request.requestId.toLowerCase().includes(search) ||
        request.title.toLowerCase().includes(search) ||
        request.department.toLowerCase().includes(search);
      const matchesStatus = this.statusFilter === 'All' || request.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  selectRequest(request: any): void {
    this.selectedRequest = request;
  }

  approve(): void {
    if (!this.selectedRequest || this.selectedRequest.status !== 'Pending') return;

    this.procurementService.approveRequest(
      this.selectedRequest.backendId,
      this.selectedRequest.remarks
    ).subscribe({
      next: (response) => {
        this.applyApprovalResponse(response);
        alert('Procurement Request Approved.');
        this.loadRequests();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to approve request.')
    });
  }

  reject(): void {
    if (!this.selectedRequest || this.selectedRequest.status !== 'Pending') return;
    if (!this.selectedRequest.remarks?.trim()) {
      alert('Please enter a rejection reason in Approval Remarks.');
      return;
    }

    this.procurementService.rejectRequest(
      this.selectedRequest.backendId,
      this.selectedRequest.remarks
    ).subscribe({
      next: (response) => {
        this.applyApprovalResponse(response);
        alert('Procurement Request Rejected.');
        this.loadRequests();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to reject request.')
    });
  }

  sendBack(): void {
    if (!this.selectedRequest) return;

    this.procurementService.sendBackRequest(
      this.selectedRequest.backendId,
      this.selectedRequest.remarks || 'Sent back for modification.'
    ).subscribe({
      next: (response) => {
        this.applyApprovalResponse(response);
        alert('Request sent back for modification.');
        this.loadRequests();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to send request back.')
    });
  }

  private applyApprovalResponse(response: any): void {
    if (!this.selectedRequest) return;
    this.selectedRequest.status = response?.request_status || this.selectedRequest.status;
    this.selectedRequest.remarks = response?.approval_remarks || this.selectedRequest.remarks;
    this.selectedRequest.approvedBy = response?.approved_by ? String(response.approved_by) : '';
    this.selectedRequest.approvalDate = response?.approved_at
      ? new Date(response.approved_at).toLocaleString('en-GB')
      : '';
  }
}
