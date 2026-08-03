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
  selector: 'app-contract-renewal-dashboard',
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
    MatChipsModule,
    MatSortModule
  ],
  templateUrl: './contract-renewal-dashboard.html',
  styleUrl: './contract-renewal-dashboard.scss'
})
export class ContractRenewalDashboard
  implements AfterViewInit {

  totalContracts = 125;

  activeContracts = 92;

  expiringContracts = 21;

  expiredContracts = 12;

  displayedColumns: string[] = [
    'contractNumber',
    'vendorName',
    'expiryDate',
    'remainingDays',
    'status',
    'actions'
  ];

  contracts = [

    {
      id: 1,
      contractNumber: 'CTR-1001',
      vendorName: 'ABC Technologies',
      expiryDate: '15-Dec-2026',
      remainingDays: 90,
      status: '90 Days Reminder'
    },

    {
      id: 2,
      contractNumber: 'CTR-1002',
      vendorName: 'Steel Works Ltd',
      expiryDate: '15-Oct-2026',
      remainingDays: 30,
      status: '30 Days Reminder'
    },

    {
      id: 3,
      contractNumber: 'CTR-1003',
      vendorName: 'Global Logistics',
      expiryDate: '20-Sep-2026',
      remainingDays: 7,
      status: '7 Days Reminder'
    },

    {
      id: 4,
      contractNumber: 'CTR-1004',
      vendorName: 'Prime Manufacturing',
      expiryDate: '01-Aug-2026',
      remainingDays: 0,
      status: 'Expired'
    }

  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private router: Router
  ) {}

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

  applyFilter(event: Event): void {

    const filterValue =
      (event.target as HTMLInputElement)
        .value;

    this.dataSource.filter =
      filterValue
        .trim()
        .toLowerCase();

  }

  filterByStatus(status: string): void {

    if (!status) {

      this.dataSource.data =
        this.contracts;

      return;

    }

    this.dataSource.data =
      this.contracts.filter(
        contract => {

          if (status === '90') {
            return contract.remainingDays === 90;
          }

          if (status === '30') {
            return contract.remainingDays === 30;
          }

          if (status === '7') {
            return contract.remainingDays === 7;
          }

          if (status === 'expired') {
            return contract.remainingDays === 0;
          }

          return true;

        }
      );

  }

  refreshDashboard(): void {

    console.log(
      'Dashboard Refreshed'
    );

    alert(
      'Contract Renewal Dashboard Refreshed'
    );

    this.dataSource.data =
      this.contracts;

  }

  renewContract(id: number): void {

    console.log(
      'Renew Contract:',
      id
    );

    alert(
      'Contract Renewal Process Started'
    );

  }

}