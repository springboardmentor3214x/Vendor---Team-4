import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

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
import {
  MatProgressBarModule
} from '@angular/material/progress-bar';
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
  selector: 'app-compliance-dashboard',
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
    MatSortModule,
    MatProgressBarModule
  ],
  templateUrl: './compliance-dashboard.html',
  styleUrl: './compliance-dashboard.scss'
})
export class ComplianceDashboard
  implements AfterViewInit {

  totalVendors = 120;

  compliantVendors = 92;

  nonCompliantVendors = 12;

  pendingVerification = 10;

  expiredCompliance = 6;

  compliancePercentage = 76;

  displayedColumns: string[] = [
    'vendorName',
    'requirement',
    'lastVerified',
    'expiryDate',
    'status',
    'actions'
  ];

  complianceRecords = [

    {
      id: 1,
      vendorName: 'ABC Technologies',
      requirement: 'GST Registration',
      lastVerified: '10-Jul-2026',
      expiryDate: '10-Jul-2027',
      status: 'Compliant'
    },

    {
      id: 2,
      vendorName: 'Global Logistics',
      requirement: 'Government License',
      lastVerified: '15-Jun-2026',
      expiryDate: '15-Sep-2026',
      status: 'Pending Verification'
    },

    {
      id: 3,
      vendorName: 'Steel Works Ltd',
      requirement: 'Safety Regulation',
      lastVerified: '05-Jan-2026',
      expiryDate: '05-Aug-2026',
      status: 'Expired'
    },

    {
      id: 4,
      vendorName: 'Prime Manufacturing',
      requirement: 'ISO Quality Standard',
      lastVerified: '20-May-2026',
      expiryDate: '20-May-2027',
      status: 'Non-Compliant'
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
        this.complianceRecords
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
        this.complianceRecords;

      return;

    }

    this.dataSource.data =
      this.complianceRecords.filter(
        record =>
          record.status === status
      );

  }

  verifyCompliance(): void {

    alert(
      'Compliance Verification Started'
    );

    console.log(
      'Compliance Verification Started'
    );

  }

  viewCompliance(id: number): void {

    console.log(
      'View Compliance:',
      id
    );

  }

  updateCompliance(id: number): void {

    console.log(
      'Update Compliance:',
      id
    );

  }

}