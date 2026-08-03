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
  selector: 'app-vendor-documentation',
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
  templateUrl: './vendor-documentation.html',
  styleUrl: './vendor-documentation.scss'
})
export class VendorDocumentation
  implements AfterViewInit {

  totalDocuments = 240;

  activeDocuments = 198;

  expiringDocuments = 28;

  expiredDocuments = 14;

  displayedColumns: string[] = [
    'documentName',
    'documentType',
    'vendorName',
    'uploadedDate',
    'status',
    'actions'
  ];

  documents = [

    {
      id: 1,
      documentName: 'GST Certificate',
      documentType: 'GST Certificate',
      vendorName: 'ABC Technologies',
      uploadedDate: '10-Jul-2026',
      status: 'Active'
    },

    {
      id: 2,
      documentName: 'PAN Card',
      documentType: 'PAN Card',
      vendorName: 'Global Logistics',
      uploadedDate: '15-Jun-2026',
      status: 'Active'
    },

    {
      id: 3,
      documentName: 'Business License',
      documentType: 'Business License',
      vendorName: 'Steel Works Ltd',
      uploadedDate: '05-May-2026',
      status: 'Expired'
    },

    {
      id: 4,
      documentName: 'Insurance Policy',
      documentType: 'Insurance Document',
      vendorName: 'Prime Manufacturing',
      uploadedDate: '20-Apr-2026',
      status: 'Active'
    }

  ];

  dataSource =
    new MatTableDataSource<any>(
      this.documents
    );

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  ngAfterViewInit(): void {

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

  filterByDocumentType(
    type: string
  ): void {

    if (!type) {

      this.dataSource.data =
        this.documents;

      return;

    }

    this.dataSource.data =
      this.documents.filter(
        document =>
          document.documentType
            .toLowerCase()
            .includes(
              type.toLowerCase()
            )
      );

  }

  filterByStatus(
    status: string
  ): void {

    if (!status) {

      this.dataSource.data =
        this.documents;

      return;

    }

    this.dataSource.data =
      this.documents.filter(
        document =>
          document.status
            .toLowerCase()
            .includes(
              status.toLowerCase()
            )
      );

  }

  uploadDocument(): void {

    console.log(
      'Upload Document'
    );

    alert(
      'Open Upload Document Form'
    );

  }

  viewDocument(
    id: number
  ): void {

    console.log(
      'View Document:',
      id
    );

  }

  downloadDocument(
    id: number
  ): void {

    console.log(
      'Download Document:',
      id
    );

    alert(
      'Document Download Started'
    );

  }

  replaceDocument(
    id: number
  ): void {

    console.log(
      'Replace Document:',
      id
    );

    alert(
      'Upload Replacement Document'
    );

  }

  deleteDocument(
    id: number
  ): void {

    const confirmed = confirm(
      'Are you sure you want to delete this document?'
    );

    if (confirmed) {

      console.log(
        'Delete Document:',
        id
      );

      alert(
        'Document Deleted Successfully'
      );

    }

  }

}