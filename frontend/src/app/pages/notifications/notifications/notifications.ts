import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface NotificationItem {

  title: string;

  message: string;

  time: string;

  read: boolean;

}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})

export class Notifications {

  /*

    GET /notifications
  */

  notifications: NotificationItem[] = [

    {
      title: 'Vendor Approved',
      message: 'ABC Technologies has been approved.',
      time: 'Just now',
      read: false
    },

    {
      title: 'Purchase Order Created',
      message: 'PO001 has been created.',
      time: '10 mins ago',
      read: true
    }

  ];

  markAsRead(notification: NotificationItem) {

    notification.read = true;

    /*
      Backend API 
    */

  }

  deleteNotification(index: number) {

    this.notifications.splice(index, 1);

    /*
      Backend API 
    */

  }

}