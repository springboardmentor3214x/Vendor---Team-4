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
import { VendorService } from '../../../services/vendor.service';

interface Vendor {

  id: number;

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

  searchText = '';

  selectedCategory = '';

  selectedStatus = '';

  vendors: Vendor[] = [];

  dataSource = new MatTableDataSource<Vendor>();
  loadVendors() {

    this.vendorService.getAllVendors(
        this.searchText,
        this.selectedCategory,
        this.selectedStatus
    ).subscribe({

        next: (response: any) => {

            this.vendors = response.items.map((v: any) => ({

                id: v.id,

                vendorId: v.vendor_id,

                companyName: v.company_name,

                category: v.vendor_category,

                contactPerson: v.contact_person,

                email: v.email,

                phone: v.phone,

                status: v.vendor_status,

                approvalStatus: v.approval_status

            }));

            this.refreshTable();

        },

        error: (err: any) => {

            console.error(err);

        }

    });

}
  ngAfterViewInit(): void {

    this.loadVendors();

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

  onSearchChange(){

    this.loadVendors();

}

  onFilterChange(){

    this.loadVendors();

}

  addVendor(): void {

    this.router.navigate(['/add-vendor']);

  }

  viewVendor(id:number){

    this.router.navigate(['/vendor-details',id]);

}

  editVendor(id:number){

    this.router.navigate(['/edit-vendor',id]);

}

  deleteVendor(id:number){

    if(confirm("Are you sure?")){

        this.vendorService.deleteVendor(id).subscribe({

            next:()=>{

                this.loadVendors();

            },

            error:(err)=>{

                console.log(err);

            }

        });

    }

}

}