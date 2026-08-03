import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnInit,
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

import { VendorService, VendorRecord } from '../../../services/vendor.service';

interface Vendor {

  id: number;

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

export class VendorList implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private vendorService: VendorService
  ) {}

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

  loading = false;

  errorMessage = '';

  // ================= Vendor Data =================
  // Retrieved from the FastAPI backend: GET /vendors/

  vendors: Vendor[] = [];

  dataSource = new MatTableDataSource<Vendor>();

  ngOnInit(): void {
    this.loadVendors();
  }

  ngAfterViewInit(): void {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  // ================= Map backend record -> view model =================

  private mapVendor(record: VendorRecord): Vendor {
    return {
      id: record.id,
      vendorId: record.vendor_id,
      companyName: record.company_name,
      category: record.vendor_category,
      contactPerson: record.contact_person,
      designation: record.designation,
      email: record.email,
      phone: record.phone,
      alternatePhone: record.alternate_phone ?? '',
      gstNumber: record.gst_number,
      panNumber: record.pan_number,
      companyRegistrationNumber: record.company_registration_number,
      vendorStatus: record.vendor_status,
      approvalStatus: record.approval_status
    };
  }

  // ================= Load Vendors =================

  loadVendors(): void {

    this.loading = true;
    this.errorMessage = '';

    this.vendorService.getVendors({
      // A large page size keeps the existing client-side
      // paginator/sort/filter behavior working against the
      // full vendor list.
      page: 1,
      size: 1000
    }).subscribe({
      next: (response) => {
        this.vendors = response.items.map(item => this.mapVendor(item));
        this.refreshTable();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Failed to load vendors.';
        this.loading = false;
      }
    });

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

  viewVendor(id: number): void {

    this.router.navigate(['/vendor-details', id]);

  }

  editVendor(id: number): void {

    this.router.navigate(['/edit-vendor', id]);

  }

  // ================= Delete Vendor =================

  deleteVendor(id: number): void {

    const confirmed = confirm(

      'Are you sure you want to delete this vendor?'

    );

    if (!confirmed) {

      return;

    }

    this.vendorService.deleteVendor(id).subscribe({
      next: () => {
        this.vendors = this.vendors.filter(vendor => vendor.id !== id);
        this.refreshTable();
        alert('Vendor deleted successfully.');
      },
      error: (err) => {
        alert(err?.error?.detail || 'Failed to delete vendor.');
      }
    });

  }

}
