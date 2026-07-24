import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Vendor {

  vendorId: string;

  companyName: string;

  category: string;

  contactPerson: string;

  designation: string;

  email: string;

  phone: string;

  alternatePhone: string;

  gstNumber: string;

  panNumber: string;

  companyRegistrationNumber: string;

  vendorStatus: string;

  approvalStatus: string;

}

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './vendor-list.html',
  styleUrl: './vendor-list.scss'
})

export class VendorList implements AfterViewInit {

  constructor(private router: Router) {}

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  displayedColumns: string[] = [

    'vendorId',

    'companyName',

    'category',

    'contactPerson',

    'email',

    'phone',

    'status',

    'approvalStatus',

    'actions'

  ];

  // ================= Dashboard Summary =================

  totalVendors = 0;

  approvedVendors = 0;

  pendingVendors = 0;

  activeVendors = 0;

  suspendedVendors = 0;

  rejectedVendors = 0;

  // ================= Search & Filters =================

  searchText = '';

  selectedCategory = '';

  selectedStatus = '';

  selectedApprovalStatus = '';

  /*
  ===========================================================

  Temporary Sample Data

  Future Backend

  GET /api/vendors

  FastAPI will retrieve vendor information
  from PostgreSQL.

  ===========================================================
  */

  vendors: Vendor[] = [

    {
      vendorId: 'V001',
      companyName: 'ABC Technologies',
      category: 'IT Vendors',
      contactPerson: 'John Smith',
      designation: 'Sales Manager',
      email: 'john@abctech.com',
      phone: '9876543210',
      alternatePhone: '9123456780',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      companyRegistrationNumber: 'CIN123456789',
      vendorStatus: 'Active',
      approvalStatus: 'Approved'
    },

    {
      vendorId: 'V002',
      companyName: 'Global Manufacturing',
      category: 'Equipment Vendors',
      contactPerson: 'David Lee',
      designation: 'Business Head',
      email: 'david@globalmfg.com',
      phone: '9876543211',
      alternatePhone: '9123456781',
      gstNumber: '27PQRSX4567K1Z2',
      panNumber: 'PQRSX4567K',
      companyRegistrationNumber: 'CIN223456789',
      vendorStatus: 'Pending',
      approvalStatus: 'Pending'
    },

    {
      vendorId: 'V003',
      companyName: 'Fast Logistics',
      category: 'Logistics Partners',
      contactPerson: 'Sarah Wilson',
      designation: 'Operations Manager',
      email: 'sarah@fastlogistics.com',
      phone: '9876543212',
      alternatePhone: '9123456782',
      gstNumber: '19LMNOP9876A1Z8',
      panNumber: 'LMNOP9876A',
      companyRegistrationNumber: 'CIN323456789',
      vendorStatus: 'Active',
      approvalStatus: 'Approved'
    },

    {
      vendorId: 'V004',
      companyName: 'Prime Services',
      category: 'Service Providers',
      contactPerson: 'Rahul Sharma',
      designation: 'Director',
      email: 'rahul@primeservices.com',
      phone: '9876543213',
      alternatePhone: '9123456783',
      gstNumber: '07ZXCVB1122P1Z4',
      panNumber: 'ZXCVB1122P',
      companyRegistrationNumber: 'CIN423456789',
      vendorStatus: 'Suspended',
      approvalStatus: 'Rejected'
    },

    {
      vendorId: 'V005',
      companyName: 'Steel Suppliers Ltd.',
      category: 'Raw Material Suppliers',
      contactPerson: 'Ankit Verma',
      designation: 'Procurement Head',
      email: 'ankit@steelsuppliers.com',
      phone: '9876543214',
      alternatePhone: '9123456784',
      gstNumber: '22FGHIJ5678L1Z6',
      panNumber: 'FGHIJ5678L',
      companyRegistrationNumber: 'CIN523456789',
      vendorStatus: 'Inactive',
      approvalStatus: 'Pending'
    },

    {
      vendorId: 'V006',
      companyName: 'MaintainPro Solutions',
      category: 'Maintenance Vendors',
      contactPerson: 'Priya Das',
      designation: 'Service Manager',
      email: 'priya@maintainpro.com',
      phone: '9876543215',
      alternatePhone: '9123456785',
      gstNumber: '33JKLMN9876Q1Z1',
      panNumber: 'JKLMN9876Q',
      companyRegistrationNumber: 'CIN623456789',
      vendorStatus: 'Active',
      approvalStatus: 'Approved'
    }

  ];

  dataSource = new MatTableDataSource<Vendor>();
    ngAfterViewInit(): void {

    this.refreshTable();

    this.dataSource.paginator = this.paginator;

    this.dataSource.sort = this.sort;

  }

  // ================= Dashboard Statistics =================

  updateDashboardStatistics(): void {

    this.totalVendors = this.vendors.length;

    this.approvedVendors = this.vendors.filter(

      vendor => vendor.approvalStatus === 'Approved'

    ).length;

    this.pendingVendors = this.vendors.filter(

      vendor => vendor.approvalStatus === 'Pending'

    ).length;

    this.activeVendors = this.vendors.filter(

      vendor => vendor.vendorStatus === 'Active'

    ).length;

    this.suspendedVendors = this.vendors.filter(

      vendor => vendor.vendorStatus === 'Suspended'

    ).length;

    this.rejectedVendors = this.vendors.filter(

      vendor => vendor.approvalStatus === 'Rejected'

    ).length;

  }

  // ================= Search & Filters =================

  get filteredVendors(): Vendor[] {

    /*
    =========================================================

    Future Backend API

    GET /api/vendors

    Query Parameters

    ?page=
    &size=
    &search=
    &category=
    &vendorStatus=
    &approvalStatus=

    FastAPI will perform:

    - Searching
    - Filtering
    - Sorting
    - Pagination

    PostgreSQL will return only the requested records.

    =========================================================
    */

    return this.vendors.filter(vendor => {

      const search = this.searchText.toLowerCase();

      const searchMatch =

        vendor.vendorId.toLowerCase().includes(search) ||

        vendor.companyName.toLowerCase().includes(search) ||

        vendor.contactPerson.toLowerCase().includes(search) ||

        vendor.email.toLowerCase().includes(search) ||

        vendor.gstNumber.toLowerCase().includes(search);

      const categoryMatch =

        !this.selectedCategory ||

        vendor.category === this.selectedCategory;

      const statusMatch =

        !this.selectedStatus ||

        vendor.vendorStatus === this.selectedStatus;

      const approvalMatch =

        !this.selectedApprovalStatus ||

        vendor.approvalStatus === this.selectedApprovalStatus;

      return searchMatch &&

             categoryMatch &&

             statusMatch &&

             approvalMatch;

    });

  }

  refreshTable(): void {

    this.dataSource.data = this.filteredVendors;

    this.updateDashboardStatistics();

  }

  onSearchChange(): void {

    this.refreshTable();

  }

  onFilterChange(): void {

    this.refreshTable();

  }

  // ================= Navigation =================

  addVendor(): void {

    this.router.navigate(['/add-vendor']);

  }

  viewVendor(id: string): void {

    this.router.navigate(['/vendor-details', id]);

  }

  editVendor(id: string): void {

    this.router.navigate(['/edit-vendor', id]);

  }

  // ================= Delete Vendor =================

  deleteVendor(id: string): void {

    const confirmed = confirm(

      'Are you sure you want to delete this vendor?'

    );

    if (!confirmed) {

      return;

    }

    this.vendors = this.vendors.filter(

      vendor => vendor.vendorId !== id

    );

    this.refreshTable();

    /*
    =========================================================

    FastAPI Endpoint

    DELETE /api/vendors/{vendorId}

    =========================================================

    Backend Responsibilities

    - Validate Vendor ID exists

    - Validate user has permission
      to delete vendors

    - Prevent deletion if

        • Procurement Records exist

        • Purchase Orders exist

        • Contracts exist

    - Remove vendor from PostgreSQL

    - Return success or
      meaningful error message

    =========================================================

    Procurement Integration

    Deleted vendors should no longer
    be available for Procurement.

    =========================================================

    */

    alert('Vendor deleted successfully.');

  }

}