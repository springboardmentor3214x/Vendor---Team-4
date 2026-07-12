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

  email: string;

  phone: string;

  status: string;

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
    MatTooltipModule
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

  searchText = '';

  selectedCategory = '';

  selectedStatus = '';

  vendors: Vendor[] = [

    {
      vendorId: 'V001',
      companyName: 'ABC Technologies',
      category: 'IT',
      contactPerson: 'John Smith',
      email: 'abc@gmail.com',
      phone: '9876543210',
      status: 'Active',
      approvalStatus: 'Approved'
    },

    {
      vendorId: 'V002',
      companyName: 'XYZ Pvt Ltd',
      category: 'Manufacturing',
      contactPerson: 'David Lee',
      email: 'xyz@gmail.com',
      phone: '9876543211',
      status: 'Pending',
      approvalStatus: 'Pending'
    },

    {
      vendorId: 'V003',
      companyName: 'Tech Solutions',
      category: 'Software',
      contactPerson: 'Alex Brown',
      email: 'tech@gmail.com',
      phone: '9876543212',
      status: 'Inactive',
      approvalStatus: 'Rejected'
    }

  ];

  dataSource = new MatTableDataSource<Vendor>();

  ngAfterViewInit(): void {

    this.refreshTable();

    this.dataSource.paginator = this.paginator;

    this.dataSource.sort = this.sort;

  }

  get filteredVendors(): Vendor[] {

    return this.vendors.filter(vendor => {

      const searchMatch =

        vendor.vendorId
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||

        vendor.companyName
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||

        vendor.contactPerson
          .toLowerCase()
          .includes(this.searchText.toLowerCase());

      const categoryMatch =

        !this.selectedCategory ||

        vendor.category === this.selectedCategory;

      const statusMatch =

        !this.selectedStatus ||

        vendor.status === this.selectedStatus;

      return searchMatch && categoryMatch && statusMatch;

    });

  }

  refreshTable(): void {

    this.dataSource.data = this.filteredVendors;

  }

  onSearchChange(): void {

    this.refreshTable();

  }

  onFilterChange(): void {

    this.refreshTable();

  }

  addVendor(): void {

    this.router.navigate(['/add-vendor']);

  }

  viewVendor(id: string): void {

    this.router.navigate(['/vendor-details', id]);

  }

  editVendor(id: string): void {

    this.router.navigate(['/edit-vendor', id]);

  }

  deleteVendor(id: string): void {

    if (confirm('Are you sure you want to delete this vendor?')) {

      this.vendors = this.vendors.filter(

        vendor => vendor.vendorId !== id

      );

      this.refreshTable();

    }

  }

}