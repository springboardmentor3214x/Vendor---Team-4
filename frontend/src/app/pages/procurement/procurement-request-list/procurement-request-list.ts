import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class ProcurementRequestList implements AfterViewInit {

  constructor(private router: Router) {}

  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';

  departmentFilter = 'All';

  statusFilter = 'All';

  priorityFilter = 'All';

  displayedColumns = [

    'requestId',

    'title',

    'department',

    'requestedBy',

    'vendor',

    'priority',

    'budget',

    'status',

    'createdDate',

    'actions'

  ];

  procurementRequests = [

    {
      requestId: 'PR-0001',
      title: 'Laptop Purchase',
      department: 'IT',
      requestedBy: 'John Smith',
      vendor: 'Not Assigned',
      priority: 'High',
      budget: 650000,
      status: 'Pending',
      createdDate: '18-07-2026'
    },

    {
      requestId: 'PR-0002',
      title: 'Office Chairs',
      department: 'Administration',
      requestedBy: 'Emma Wilson',
      vendor: 'ABC Furniture',
      priority: 'Medium',
      budget: 250000,
      status: 'Approved',
      createdDate: '16-07-2026'
    },

    {
      requestId: 'PR-0003',
      title: 'Printer Toner',
      department: 'Accounts',
      requestedBy: 'David Brown',
      vendor: 'XYZ Supplies',
      priority: 'Low',
      budget: 45000,
      status: 'Completed',
      createdDate: '10-07-2026'
    },

    {
      requestId: 'PR-0004',
      title: 'Network Switch',
      department: 'IT',
      requestedBy: 'Alex Thomas',
      vendor: 'Not Assigned',
      priority: 'Critical',
      budget: 320000,
      status: 'Rejected',
      createdDate: '12-07-2026'
    }

  ];

  dataSource = new MatTableDataSource(this.procurementRequests);

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort;

    this.dataSource.paginator = this.paginator;

  }

  get totalRequests() {

    return this.procurementRequests.length;

  }

  get pendingRequests() {

    return this.procurementRequests.filter(

      x => x.status === 'Pending'

    ).length;

  }

  get approvedRequests() {

    return this.procurementRequests.filter(

      x => x.status === 'Approved'

    ).length;

  }

  get rejectedRequests() {

    return this.procurementRequests.filter(

      x => x.status === 'Rejected'

    ).length;

  }

  get filteredRequests() {

    return this.procurementRequests.filter(request => {

      const matchesSearch =

        request.requestId.toLowerCase().includes(this.searchText.toLowerCase()) ||

        request.title.toLowerCase().includes(this.searchText.toLowerCase()) ||

        request.department.toLowerCase().includes(this.searchText.toLowerCase()) ||

        request.vendor.toLowerCase().includes(this.searchText.toLowerCase()) ||

        request.requestedBy.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesDepartment =

        this.departmentFilter === 'All' ||

        request.department === this.departmentFilter;

      const matchesStatus =

        this.statusFilter === 'All' ||

        request.status === this.statusFilter;

      const matchesPriority =

        this.priorityFilter === 'All' ||

        request.priority === this.priorityFilter;

      return (

        matchesSearch &&

        matchesDepartment &&

        matchesStatus &&

        matchesPriority

      );

    });

  }

  viewRequest(request: any) {

  this.router.navigate([
    '/procurement-request/view',
    request.requestId
  ]);

}

  editRequest(request: any) {

  if (request.status !== 'Pending') {
    return;
  }

  this.router.navigate([
    '/procurement-request/edit',
    request.requestId
  ]);

}

  approveRequest(request: any) {

  request.status = 'Approved';

  if (request.vendor === 'Not Assigned') {
    request.vendor = 'Vendor Assignment Pending';
  }

  alert('Request Approved');

}

  rejectRequest(request: any) {

    request.status = 'Rejected';

    alert('Request Rejected');

  }

  deleteRequest(request: any) {

  if (request.status !== 'Pending') {
    return;
  }

  if (confirm('Delete this procurement request?')) {

    this.procurementRequests =
      this.procurementRequests.filter(
        x => x.requestId !== request.requestId
      );

  }

}

  addRequest() {

    this.router.navigate(['/procurement-request']);

  }

}