import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcurementService } from '../../../services/procurement.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-procurement-request-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './procurement-request-list.html',
  styleUrl: './procurement-request-list.scss'
})
export class ProcurementRequestList implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private procurementService: ProcurementService
  ) {}

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';
  departmentFilter = 'All';
  statusFilter = 'All';
  priorityFilter = 'All';
  loading = true;

  displayedColumns = [
    'requestId', 'title', 'department', 'requestedBy', 'vendor',
    'priority', 'budget', 'status', 'createdDate', 'actions'
  ];

  procurementRequests: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  ngOnInit(): void {
    this.loadRequests();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private mapRequest(item: any): any {
    return {
      backendId: item.id,
      requestId: item.request_number,
      title: item.request_title,
      department: item.department_name,
      requestedBy: String(item.requested_by),
      vendor: item.vendor_id ? `Vendor #${item.vendor_id}` : 'Not Assigned',
      vendorId: item.vendor_id,
      priority: item.priority,
      budget: item.estimated_budget,
      status: item.request_status,
      approvalStatus: item.approval_status,
      createdDate: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '',
      raw: item
    };
  }

  loadRequests(): void {
    this.loading = true;

    this.procurementService.getRequests({ page: 1, size: 1000 }).subscribe({
      next: (response) => {
        this.procurementRequests = (response?.items || []).map((item: any) => this.mapRequest(item));
        this.dataSource.data = this.procurementRequests;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load procurement requests:', error);
        this.loading = false;
        alert(error?.error?.detail || 'Failed to load procurement requests.');
      }
    });
  }

  get totalRequests(): number { return this.procurementRequests.length; }
  get pendingRequests(): number { return this.procurementRequests.filter(x => x.status === 'Pending').length; }
  get approvedRequests(): number { return this.procurementRequests.filter(x => x.status === 'Approved').length; }
  get rejectedRequests(): number { return this.procurementRequests.filter(x => x.status === 'Rejected').length; }

  get filteredRequests(): any[] {
    const search = this.searchText.trim().toLowerCase();

    return this.procurementRequests.filter(request => {
      const matchesSearch = !search || [
        request.requestId,
        request.title,
        request.department,
        request.vendor,
        request.requestedBy
      ].some(value => String(value ?? '').toLowerCase().includes(search));

      const matchesDepartment = this.departmentFilter === 'All' || request.department === this.departmentFilter;
      const matchesStatus = this.statusFilter === 'All' || request.status === this.statusFilter;
      const matchesPriority = this.priorityFilter === 'All' || request.priority === this.priorityFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesPriority;
    });
  }

  viewRequest(request: any): void {
    this.router.navigate(['/procurement-request/view', request.backendId]);
  }

  editRequest(request: any): void {
    if (request.status !== 'Pending' && request.status !== 'Draft') return;
    this.router.navigate(['/procurement-request/edit', request.backendId]);
  }

  approveRequest(request: any): void {
    if (request.status !== 'Pending') return;

    const remarks = prompt('Approval remarks (optional):', '') ?? '';

    this.procurementService.approveRequest(request.backendId, remarks).subscribe({
      next: () => {
        alert('Procurement request approved successfully.');
        this.loadRequests();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to approve procurement request.')
    });
  }

  rejectRequest(request: any): void {
    if (request.status !== 'Pending') return;

    const remarks = prompt('Reason for rejection:', 'Request rejected.') ?? '';
    if (!remarks.trim()) return;

    this.procurementService.rejectRequest(request.backendId, remarks).subscribe({
      next: () => {
        alert('Procurement request rejected successfully.');
        this.loadRequests();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to reject procurement request.')
    });
  }

  deleteRequest(request: any): void {
    if (request.status !== 'Pending' && request.status !== 'Draft') return;
    if (!confirm(`Delete ${request.requestId}?`)) return;

    this.procurementService.deleteRequest(request.backendId).subscribe({
      next: () => {
        alert('Procurement request deleted successfully.');
        this.loadRequests();
      },
      error: (error) => alert(error?.error?.detail || 'Failed to delete procurement request.')
    });
  }

  addRequest(): void {
    this.router.navigate(['/procurement-request']);
  }
}
