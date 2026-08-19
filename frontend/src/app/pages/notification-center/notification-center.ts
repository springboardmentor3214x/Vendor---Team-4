import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, NotificationResponse } from '../../services/notification.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  description: string;
  module: string;
  relatedRecordId: string;
  timestamp: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  deliveryMethod: string[];
  read: boolean;
}

@Component({
  selector: 'app-notification-center',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSlideToggleModule
  ],

  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss'
})
export class NotificationCenter implements OnInit {

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  // ============================================================
  // NAVIGATION
  // ============================================================

  goToNotificationCenter(): void {
    this.showNotificationDropdown = false;
  }

  goToDashboard(): void {
    const role = localStorage.getItem('role');

    if (role === 'admin' || role === 'administrator') {
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    if (
      role === 'vendor' ||
      role === 'Vendor'
    ) {
      this.router.navigate(['/vendor-home']);
      return;
    }

    if (
      role === 'procurement_manager' ||
      role === 'Procurement Manager'
    ) {
      this.router.navigate(['/procurement-dashboard']);
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }


  // ============================================================
  // NOTIFICATION DROPDOWN
  // ============================================================

  showNotificationDropdown = false;

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown =
      !this.showNotificationDropdown;
  }


  // ============================================================
  // SEARCH & FILTERS
  // ============================================================

  searchText = '';

  selectedModule = 'All';

  selectedPriority = 'All';

  selectedReadStatus = 'All';

  selectedDate: Date | null = null;


  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  notifications: NotificationItem[] = [];

  // ============================================================
  // FILTERED NOTIFICATIONS
  // ============================================================

  filteredNotifications: NotificationItem[] = [];


  // ============================================================
  // SELECTED NOTIFICATION
  // ============================================================

  selectedNotification: NotificationItem | null = null;


  // ============================================================
  // SETTINGS
  // ============================================================

  settings = {
    inApp: true,
    email: true,
    sms: true,
    highPriority: true
  };


  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.loadSettings();
    this.fetchBackendNotifications();
  }

  fetchBackendNotifications(): void {
    this.notificationService.getStoredNotifications().subscribe({
      next: (data: NotificationResponse[]) => {
        if (data && data.length > 0) {
          this.notifications = data.map((item) => ({
            id: item.id,
            type: (item.notification_type || 'system').toLowerCase(),
            title: item.title,
            description: item.description,
            module: item.related_module || 'System',
            relatedRecordId: item.related_record_id ? String(item.related_record_id) : '-',
            timestamp: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            priority: (item.priority === 'HIGH' ? 'High' : item.priority === 'MEDIUM' ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
            deliveryMethod: [item.delivery_method === 'EMAIL' ? 'Email' : item.delivery_method === 'SMS' ? 'SMS' : 'In-App'],
            read: item.is_read
          }));
        }
        this.applyFilters();
        this.cdr.detectChanges();
        const firstUnread = this.notifications.find((n) => !n.read);
        if (firstUnread) {
          this.selectedNotification = firstUnread;
        }
      },
      error: (err) => {
        console.warn('Backend notification fetch error:', err);
        this.applyFilters();
        this.cdr.detectChanges();
        const firstUnread = this.notifications.find((n) => !n.read);
        if (firstUnread) {
          this.selectedNotification = firstUnread;
        }
      }
    });
  }


  // ============================================================
  // COUNTERS
  // ============================================================

  get totalNotifications(): number {
    return this.notifications.length;
  }

  get unreadCount(): number {
    return this.notifications.filter(
      notification => !notification.read
    ).length;
  }

  get highPriorityCount(): number {
    return this.notifications.filter(
      notification => notification.priority === 'High'
    ).length;
  }

  get emailNotificationCount(): number {
    return this.notifications.filter(
      notification =>
        notification.deliveryMethod.includes('Email')
    ).length;
  }

  get smsNotificationCount(): number {
    return this.notifications.filter(
      notification =>
        notification.deliveryMethod.includes('SMS')
    ).length;
  }


  // ============================================================
  // RECENT NOTIFICATIONS
  // ============================================================

  get recentNotifications(): NotificationItem[] {
    return this.notifications.slice(0, 5);
  }


  // ============================================================
  // APPLY FILTERS
  // ============================================================

  applyFilters(): void {

    const search =
      this.searchText.trim().toLowerCase();

    this.filteredNotifications =
      this.notifications.filter(notification => {

        const matchesSearch =
          !search ||
          notification.title
            .toLowerCase()
            .includes(search) ||
          notification.description
            .toLowerCase()
            .includes(search) ||
          notification.module
            .toLowerCase()
            .includes(search) ||
          notification.relatedRecordId
            .toLowerCase()
            .includes(search);


        const matchesModule =
          this.selectedModule === 'All' ||
          notification.module.toLowerCase().includes(this.selectedModule.toLowerCase()) ||
          this.selectedModule.toLowerCase().includes(notification.module.toLowerCase());


        const matchesPriority =
          this.selectedPriority === 'All' ||
          notification.priority === this.selectedPriority;


        const matchesReadStatus =
          this.selectedReadStatus === 'All' ||
          (
            this.selectedReadStatus === 'Unread' &&
            !notification.read
          ) ||
          (
            this.selectedReadStatus === 'Read' &&
            notification.read
          );


        const matchesDate =
          !this.selectedDate ||
          this.isSameDate(
            notification.date,
            this.selectedDate
          );


        return (
          matchesSearch &&
          matchesModule &&
          matchesPriority &&
          matchesReadStatus &&
          matchesDate
        );

      });

  }


  private isSameDate(
    notificationDate: string,
    selectedDate: Date
  ): boolean {

    const date = new Date(
      notificationDate + 'T00:00:00'
    );

    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedModule = 'All';

    this.selectedPriority = 'All';

    this.selectedReadStatus = 'All';

    this.selectedDate = null;

    this.applyFilters();

  }


  filterByReadStatus(
    status: 'Unread' | 'Read'
  ): void {

    this.selectedReadStatus = status;

    this.applyFilters();

    this.scrollToNotificationHistory();

  }


  filterByPriority(
    priority: 'High' | 'Medium' | 'Low'
  ): void {

    this.selectedPriority = priority;

    this.applyFilters();

    this.scrollToNotificationHistory();

  }


  filterByModule(module: string): void {
    this.selectedModule = module;
    this.applyFilters();
    if (this.filteredNotifications.length > 0) {
      this.selectedNotification = this.filteredNotifications[0];
    }
    this.scrollToNotificationHistory();
  }

  private scrollToNotificationHistory(): void {
    setTimeout(() => {
      const element =
        document.querySelector('.filter-card') ||
        document.querySelector('.notification-list-card');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 50);
  }


  selectNotification(
    notification: NotificationItem
  ): void {

    this.selectedNotification = notification;

    if (!notification.read) {
      this.markAsRead(notification);
    }

  }


  openNotification(
    notification: NotificationItem
  ): void {

    this.selectedNotification = notification;

    if (!notification.read) {
      this.markAsRead(notification);
    }

    this.showNotificationDropdown = false;

  }


  closeNotificationDetails(): void {

    this.selectedNotification = null;

  }


  markAsRead(
    notification: NotificationItem
  ): void {

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => { notification.read = true; this.applyFilters(); this.cdr.detectChanges(); },
      error: (err) => console.error('Failed to mark notification as read:', err)
    });

  }


  markAsUnread(
    notification: NotificationItem
  ): void {

    this.notificationService.markAsUnread(notification.id).subscribe({
      next: () => { notification.read = false; this.applyFilters(); this.cdr.detectChanges(); },
      error: err => console.error('Failed to mark notification as unread:', err)
    });

  }


  markAllAsRead(): void {

    this.notificationService.markAllAsRead().subscribe({
      next: () => { this.notifications.forEach(n => n.read = true); this.applyFilters(); this.cdr.detectChanges(); },
      error: (err) => console.error('Failed to mark all notifications as read:', err)
    });

  }


  getNotificationIcon(type: string): string {

    switch (type) {

      case 'procurement':
        return 'shopping_cart';

      case 'purchase-order':
        return 'receipt_long';

      case 'delivery':
        return 'local_shipping';

      case 'vendor':
        return 'business';

      case 'contract':
        return 'description';

      case 'compliance':
        return 'verified_user';

      case 'communication':
        return 'chat';

      case 'performance':
        return 'trending_up';

      case 'reports':
        return 'bar_chart';

      case 'invoice':
        return 'payments';

      default:
        return 'notifications';

    }

  }


  getDeliveryIcon(method: string): string {

    switch (method) {

      case 'In-App':
        return 'notifications';

      case 'Email':
        return 'email';

      case 'SMS':
        return 'sms';

      default:
        return 'notifications';

    }

  }


  saveNotificationSettings(): void {

    localStorage.setItem(
      'notificationSettings',
      JSON.stringify(this.settings)
    );

    alert('Notification settings saved successfully.');

  }


  private loadSettings(): void {

    const savedSettings =
      localStorage.getItem('notificationSettings');

    if (!savedSettings) {
      return;
    }

    try {

      const parsed =
        JSON.parse(savedSettings);

      this.settings = {
        ...this.settings,
        ...parsed
      };

    } catch {

      console.warn(
        'Unable to load notification settings.'
      );

    }

  }

}
