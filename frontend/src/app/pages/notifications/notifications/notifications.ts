import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';

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

export class Notifications implements OnInit {

  /*

    GET /notifications
  */

  notifications: NotificationItem[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications(30).subscribe({
      next: rows => { this.notifications = (rows || []).map(r => ({ title: r.title, message: r.description, time: new Date(r.created_at).toLocaleString(), read: r.is_read })); },
      error: err => console.error('Failed to load notifications:', err)
    });
  }

  markAsRead(notification: NotificationItem) {

    this.notificationService.getNotifications(30).subscribe({
      next: rows => { const row = rows.find(r => r.title === notification.title && r.description === notification.message); if (row) this.notificationService.markAsRead(row.id).subscribe({ next: () => notification.read = true }); },
      error: err => console.error('Failed to mark notification:', err)
    });

  }

  deleteNotification(index: number) {

    this.notifications.splice(index, 1);

    /*
      Backend API 
    */

  }

}