import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-procurement-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './procurement-approval.html',
  styleUrl: './procurement-approval.scss'
})
export class ProcurementApproval {

  searchText = '';
  statusFilter = 'All';

  selectedRequest: any = null;

  requests = [

    {
      requestId: 'PR-0001',
      title: 'Laptop Purchase',
      department: 'IT',
      requestedBy: 'John Smith',

      product: 'Dell Latitude 5550',
      category: 'Electronics',
      quantity: 10,
      unit: 'Pieces',

      budget: 650000,
      deliveryDate: '20-07-2026',

      priority: 'High',

      justification: 'Replacement of outdated office laptops.',
      additionalRemarks: 'Procurement required before next quarter.',

      status: 'Pending',

      approvedBy: '',
      approvalDate: '',
      remarks: ''
    },

    {
      requestId: 'PR-0002',
      title: 'Office Chairs',
      department: 'Administration',
      requestedBy: 'Emma Wilson',

      product: 'Ergonomic Office Chair',
      category: 'Furniture',
      quantity: 25,
      unit: 'Pieces',

      budget: 250000,
      deliveryDate: '28-07-2026',

      priority: 'Medium',

      justification: 'Furniture upgrade for new employees.',
      additionalRemarks: 'Vendor should provide warranty.',

      status: 'Pending',

      approvedBy: '',
      approvalDate: '',
      remarks: ''
    },

    {
      requestId: 'PR-0003',
      title: 'Network Switches',
      department: 'IT',
      requestedBy: 'David Brown',

      product: 'Cisco Managed Switch',
      category: 'Networking',
      quantity: 5,
      unit: 'Units',

      budget: 420000,
      deliveryDate: '05-08-2026',

      priority: 'Critical',

      justification: 'Expansion of office network infrastructure.',
      additionalRemarks: 'Installation required after delivery.',

      status: 'Approved',

      approvedBy: 'Procurement Manager',
      approvalDate: '18-07-2026',
      remarks: 'Approved for Vendor Assignment.'
    }

  ];

  get filteredRequests() {

    return this.requests.filter(request => {

      const matchesSearch =

        request.requestId.toLowerCase().includes(this.searchText.toLowerCase()) ||

        request.title.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus =

        this.statusFilter === 'All' ||

        request.status === this.statusFilter;

      return matchesSearch && matchesStatus;

    });

  }

  selectRequest(request: any) {

    this.selectedRequest = request;

  }

  approve() {

    if (!this.selectedRequest) return;

    this.selectedRequest.status = 'Approved';

    this.selectedRequest.approvedBy = 'Procurement Manager';

    this.selectedRequest.approvalDate = new Date().toLocaleDateString();

    if (!this.selectedRequest.remarks.trim()) {

      this.selectedRequest.remarks = 'Request Approved';

    }

    alert('Procurement Request Approved.');

  }

  reject() {

    if (!this.selectedRequest) return;

    this.selectedRequest.status = 'Rejected';

    this.selectedRequest.approvedBy = 'Procurement Manager';

    this.selectedRequest.approvalDate = new Date().toLocaleDateString();

    if (!this.selectedRequest.remarks.trim()) {

      this.selectedRequest.remarks = 'Request Rejected';

    }

    alert('Procurement Request Rejected.');

  }

  sendBack() {

    if (!this.selectedRequest) return;

    this.selectedRequest.status = 'Pending';

    this.selectedRequest.approvedBy = '';

    this.selectedRequest.approvalDate = '';

    if (!this.selectedRequest.remarks.trim()) {

      this.selectedRequest.remarks = 'Sent back for modification.';

    }

    alert('Request sent back for modification.');

  }

}