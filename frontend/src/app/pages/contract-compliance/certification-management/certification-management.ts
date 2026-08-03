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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-certification-management',
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
  templateUrl: './certification-management.html',
  styleUrl: './certification-management.scss'
})
export class CertificationManagement
  implements AfterViewInit {

  totalCertifications = 120;

  activeCertifications = 95;

  expiringCertifications = 18;

  expiredCertifications = 7;

  displayedColumns: string[] = [
    'certificationName',
    'certificateNumber',
    'vendorName',
    'issuingAuthority',
    'expiryDate',
    'status',
    'actions'
  ];

  certifications = [

    {
      id: 1,
      certificationName: 'ISO 9001',
      certificateNumber: 'ISO-9001-001',
      vendorName: 'ABC Technologies',
      issuingAuthority: 'ISO Board',
      expiryDate: '15-Dec-2026',
      status: 'Active'
    },

    {
      id: 2,
      certificationName: 'ISO 27001',
      certificateNumber: 'ISO-27001-002',
      vendorName: 'Global Logistics',
      issuingAuthority: 'ISO Board',
      expiryDate: '01-Oct-2026',
      status: 'Expiring'
    },

    {
      id: 3,
      certificationName: 'GST Registration',
      certificateNumber: 'GST-REG-003',
      vendorName: 'Steel Works Ltd',
      issuingAuthority: 'Government Authority',
      expiryDate: '01-Aug-2026',
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
        this.certifications
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
        this.certifications;

      return;

    }

    this.dataSource.data =
      this.certifications.filter(
        cert =>
          cert.status === status
      );

  }

  addCertification(): void {
/*
    this.router.navigate([
    '/add-certification'
  ]);
*/

  }

  viewCertificate(id: number): void {

    console.log(
      'View Certificate:',
      id
    );

  }

  editCertificate(id: number): void {

    console.log(
      'Edit Certificate:',
      id
    );

  }

  replaceCertificate(id: number): void {

    console.log(
      'Replace Certificate:',
      id
    );

    alert(
      'Upload New Certificate'
    );

  }

}