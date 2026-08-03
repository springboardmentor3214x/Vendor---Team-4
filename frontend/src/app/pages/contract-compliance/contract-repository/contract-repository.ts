import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

@Component({
  selector: 'app-contract-repository',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule
  ],
  templateUrl: './contract-repository.html',
  styleUrl: './contract-repository.scss'
})
export class ContractRepository
  implements AfterViewInit {

  constructor(
    private router: Router
  ) {}

  // ================= Statistics =================

  totalContracts = 125;

  activeContracts = 92;

  expiringSoon = 14;

  expiredContracts = 8;

  renewedContracts = 11;

  // ================= Table =================

  displayedColumns: string[] = [
    'contractNumber',
    'title',
    'vendor',
    'type',
    'startDate',
    'endDate',
    'value',
    'status',
    'actions'
  ];

  contracts = [

    {
      contractNumber: 'CTR-1001',
      title: 'IT Hardware Supply Agreement',
      vendor: 'ABC Technologies',
      type: 'Supply Contract',
      startDate: '01-Jan-2026',
      endDate: '31-Dec-2028',
      value: '₹15,00,000',
      status: 'Active'
    },

    {
      contractNumber: 'CTR-1002',
      title: 'Office Furniture Contract',
      vendor: 'XYZ Suppliers',
      type: 'Service Contract',
      startDate: '15-Feb-2025',
      endDate: '14-Feb-2027',
      value: '₹8,50,000',
      status: 'Expiring Soon'
    },

    {
      contractNumber: 'CTR-1003',
      title: 'Software Licensing Agreement',
      vendor: 'Tech Solutions Ltd',
      type: 'Software Contract',
      startDate: '01-Jan-2023',
      endDate: '31-Dec-2025',
      value: '₹25,00,000',
      status: 'Expired'
    },

    {
      contractNumber: 'CTR-1004',
      title: 'Network Infrastructure Support',
      vendor: 'Global Systems',
      type: 'Maintenance Contract',
      startDate: '01-Apr-2026',
      endDate: '31-Mar-2029',
      value: '₹18,00,000',
      status: 'Renewed'
    }

  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  ngAfterViewInit(): void {

    this.dataSource =
      new MatTableDataSource(
        this.contracts
      );

    this.dataSource.paginator =
      this.paginator;

    this.dataSource.sort =
      this.sort;

  }

  // ================= Search =================

  applyFilter(event: Event): void {

    const filterValue =
      (event.target as HTMLInputElement)
        .value;

    this.dataSource.filter =
      filterValue
        .trim()
        .toLowerCase();

  }

  // ================= Vendor Filter =================

  filterByVendor(vendor: string): void {

    if (!vendor) {

      this.dataSource.data =
        this.contracts;

      return;

    }

    this.dataSource.data =
      this.contracts.filter(
        contract =>
          contract.vendor
            .toLowerCase()
            .includes(
              vendor.toLowerCase()
            )
      );

  }

  // ================= Status Filter =================

  filterByStatus(status: string): void {

    if (!status) {

      this.dataSource.data =
        this.contracts;

      return;

    }

    this.dataSource.data =
      this.contracts.filter(
        contract =>
          contract.status
            .toLowerCase()
            .includes(
              status.toLowerCase()
            )
      );

  }

  // ================= Navigation =================

  addContract(): void {

    this.router.navigate([
      '/add-contract'
    ]);

  }

  viewContract(
    contractNumber: string
  ): void {

    this.router.navigate([
      '/contract-details',
      contractNumber
    ]);

  }

  editContract(
    contractNumber: string
  ): void {

    this.router.navigate([
      '/edit-contract',
      contractNumber
    ]);

  }

  renewContract(
    contractNumber: string
  ): void {

    console.log(
      'Renew Contract:',
      contractNumber
    );

    alert(
      'Contract Renewal Process Started'
    );

  }

}