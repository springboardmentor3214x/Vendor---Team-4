import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { CommunicationService } from '../../../services/communication.service';

@Component({
  selector: 'app-communication-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './communication-notifications.html',
  styleUrl: './communication-notifications.scss'
})
export class CommunicationNotifications implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalNotifications = 0;
  unreadNotifications = 0;
  emailNotifications = 0;
  pendingDiscussions = 0;
  deliveredEmails = 0;
  readNotifications = 0;
  smsReady = 0;
  appNotifications = 0;

  vendorMessageAlerts = true;
  vendorReplyAlerts = true;
  documentUploadAlerts = true;
  discussionAlerts = true;
  contractAlerts = true;
  complianceAlerts = true;

  showSendModal = false;
  sendTestForm!: FormGroup;
  recipientsList: string[] = [];

  displayedColumns = [
    'notificationId',
    'recipient',
    'type',
    'subject',
    'deliveryStatus',
    'readStatus',
    'timestamp',
    'actions'
  ];

  notifications: any[] = [];
  dataSource = new MatTableDataSource<any>();
  selectedNotification: any = null;

  private currentUserId = 0;
  private contacts: any[] = [];
  private allDiscussions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sendTestForm = this.fb.group({
      recipient: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      priority: ['MEDIUM', Validators.required]
    });
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadData(): void {
    this.communicationService.getCurrentUser().subscribe({
      next: user => {
        this.currentUserId = Number(user.id);
        this.communicationService.getContacts().subscribe({
          next: contacts => {
            this.contacts = contacts || [];
            this.recipientsList = this.contacts.map(c => c.email).filter(Boolean);
            this.communicationService.getDiscussions().subscribe({
              next: discussions => {
                this.allDiscussions = discussions || [];
                this.loadNotifications();
              },
              error: () => this.loadNotifications()
            });
          },
          error: () => this.loadNotifications()
        });
      },
      error: err => console.error('Failed to load current user', err)
    });
  }

  loadNotifications(): void {
    this.communicationService.getStoredNotifications().subscribe({
      next: data => {
        this.notifications = (data || []).map((n: any) => this.mapNotification(n));
        this.dataSource.data = this.notifications;
        this.selectedNotification = this.notifications[0] || null;
        this.updateStats();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load stored notifications', err);
        this.notifications = [];
        this.dataSource.data = [];
        this.updateStats();
        this.cdr.detectChanges();
      }
    });
  }

  private mapNotification(n: any): any {
    const contact = this.contacts.find(c => Number(c.id) === Number(n.user_id));
    return {
      id: n.id,
      notificationId: `NTF-${String(n.id).padStart(6, '0')}`,
      recipient: contact?.email || contact?.name || `User #${n.user_id}`,
      type: this.humanizeEnum(n.notification_type),
      subject: n.title,
      description: n.description,
      deliveryStatus: this.humanizeEnum(n.delivery_method || 'IN_APP'),
      readStatus: n.is_read ? 'Read' : 'Unread',
      timestamp: n.created_at ? new Date(n.created_at).toLocaleString() : '-',
      relatedRecord: n.related_record_id ? String(n.related_record_id) : '-',
      raw: n
    };
  }

  private humanizeEnum(value: string): string {
    return String(value || '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  private updateStats(): void {
    this.totalNotifications = this.notifications.length;
    this.unreadNotifications = this.notifications.filter(n => n.readStatus === 'Unread').length;
    this.readNotifications = this.notifications.filter(n => n.readStatus === 'Read').length;
    this.emailNotifications = this.notifications.filter(n => n.raw?.delivery_method === 'EMAIL').length;
    this.deliveredEmails = this.emailNotifications;
    this.smsReady = this.notifications.filter(n => n.raw?.delivery_method === 'SMS').length;
    this.appNotifications = this.notifications.filter(n => n.raw?.delivery_method === 'IN_APP').length;
    this.pendingDiscussions = this.allDiscussions.filter(d =>
      String(d.status).toUpperCase() !== 'CLOSED'
    ).length;
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  filterByType(type: string): void {
    this.dataSource.data = type === 'all'
      ? this.notifications
      : this.notifications.filter(n => n.type === type);
  }

  filterByStatus(status: string): void {
    this.dataSource.data = status === 'all'
      ? this.notifications
      : this.notifications.filter(n =>
          n.readStatus === status || n.deliveryStatus === status
        );
  }

  selectNotification(notification: any): void {
    this.selectedNotification = notification;
  }

  viewNotification(notification: any): void {
    this.selectedNotification = notification;
  }

  markAsRead(notification: any): void {
    if (!notification?.id || notification.readStatus === 'Read') return;
    this.communicationService.markNotificationRead(notification.id).subscribe({
      next: updated => {
        notification.raw = updated;
        notification.readStatus = 'Read';
        this.updateStats();
        this.cdr.detectChanges();
      },
      error: err => alert(err?.error?.detail || 'Notification could not be marked as read.')
    });
  }

  openSendTestModal(): void {
    if (!this.recipientsList.length) {
      alert('No users are available to receive a notification.');
      return;
    }
    this.sendTestForm.reset({
      recipient: this.recipientsList[0],
      subject: '',
      message: '',
      priority: 'MEDIUM'
    });
    this.showSendModal = true;
  }

  closeSendTestModal(): void {
    this.showSendModal = false;
  }

  submitSendTestNotification(): void {
    this.sendTestNotification();
  }

  sendTestNotification(): void {
    if (this.sendTestForm.invalid) {
      this.sendTestForm.markAllAsTouched();
      return;
    }

    const val = this.sendTestForm.value;
    const recipient = this.contacts.find(c => c.email === val.recipient);
    if (!recipient) {
      alert('Selected recipient is no longer available.');
      return;
    }

    this.communicationService.createNotification({
      user_id: Number(recipient.id),
      notification_type: 'SYSTEM',
      title: val.subject,
      description: val.message,
      related_module: 'Communication',
      priority: val.priority,
      delivery_method: 'IN_APP'
    }).subscribe({
      next: () => {
        this.showSendModal = false;
        this.loadNotifications();
      },
      error: err => alert(err?.error?.detail || 'Notification could not be created.')
    });
  }

  markAllAsRead(): void {
    this.communicationService.markAllNotificationsRead().subscribe({
      next: () => this.loadNotifications(),
      error: err => alert(err?.error?.detail || 'Notifications could not be updated.')
    });
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }
}
