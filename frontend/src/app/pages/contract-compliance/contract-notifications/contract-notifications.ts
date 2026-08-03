import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';

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
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contract-notifications',
  standalone: true,
  imports: [
    CommonModule,

    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSortModule,
    MatButtonModule
  ],
  templateUrl: './contract-notifications.html',
  styleUrl: './contract-notifications.scss'
})
export class ContractNotifications
  implements AfterViewInit {

  totalNotifications = 35;

  expiringContracts = 18;

  urgentNotifications = 9;

  expiredContracts = 8;

  displayedColumns: string[] = [
    'contractNumber',
    'vendorName',
    'expiryDate',
    'remainingDays',
    'renewalStatus',
    'notificationChannel',
    'actions'
  ];

  notifications = [

    {
      id: 1,
      contractNumber: 'CNT-1001',
      vendorName: 'ABC Technologies',
      expiryDate: '30-Oct-2026',
      remainingDays: 90,
      renewalStatus: 'Pending',
      notificationChannel: 'Dashboard'
    },

    {
      id: 2,
      contractNumber: 'CNT-1002',
      vendorName: 'Global Logistics',
      expiryDate: '31-Aug-2026',
      remainingDays: 30,
      renewalStatus: 'Pending',
      notificationChannel: 'Email'
    },

    {
      id: 3,
      contractNumber: 'CNT-1003',
      vendorName: 'Steel Works Ltd',
      expiryDate: '08-Aug-2026',
      remainingDays: 7,
      renewalStatus: 'Renewal In Progress',
      notificationChannel: 'Dashboard + Email'
    },

    {
      id: 4,
      contractNumber: 'CNT-1004',
      vendorName: 'Prime Manufacturing',
      expiryDate: '01-Aug-2026',
      remainingDays: 0,
      renewalStatus: 'Expired',
      notificationChannel: 'Dashboard + Email'
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
        this.notifications
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

  filterByType(type: string): void {

    if (!type) {

      this.dataSource.data =
        this.notifications;

      return;

    }

    this.dataSource.data =
      this.notifications.filter(
        item => {

          if (type === '90') {
            return item.remainingDays === 90;
          }

          if (type === '30') {
            return item.remainingDays === 30;
          }

          if (type === '7') {
            return item.remainingDays === 7;
          }

          if (type === 'expired') {
            return item.remainingDays === 0;
          }

          return true;

        }
      );

  }

  viewNotification(id: number): void {

    console.log(
      'View Notification:',
      id
    );

  }

  markAsRead(id: number): void {

    console.log(
      'Notification Marked As Read:',
      id
    );

    alert(
      'Notification Marked As Read'
    );

  }

  sendReminder(id: number): void {

    console.log(
      'Reminder Sent:',
      id
    );

    alert(
      'Reminder Sent Successfully'
    );

  }

}