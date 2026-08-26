import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommunicationService } from '../../../services/communication.service';

@Component({
  selector: 'app-communication-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './communication-dashboard.html',
  styleUrl: './communication-dashboard.scss'
})
export class CommunicationDashboard implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  unreadMessages = 0;
  recentDiscussions = 0;
  sharedFiles = 0;
  pendingResponses = 0;
  totalNotifications = 0;
  activityLogs = 0;

  contractsCount = 0;
  invoicesCount = 0;
  complianceDocsCount = 0;
  reportsCount = 0;

  pendingDocumentReviews = 0;
  pendingApprovals = 0;
  notifications: string[] = [];

  displayedColumns = ['sender', 'subject', 'date', 'status'];
  messages: any[] = [];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private communicationService: CommunicationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDashboard(): void {
    this.communicationService.getCommunicationDashboard().subscribe({
      next: dashboard => {
        this.unreadMessages = Number(dashboard?.unread_messages || 0);
        this.recentDiscussions = Number(dashboard?.total_discussions || 0);
        this.sharedFiles = Number(dashboard?.total_shared_files || 0);
        this.activityLogs = Number(dashboard?.total_activity_logs || 0);
        this.pendingResponses = this.unreadMessages;
        this.loadNotifications();
      },
      error: err => {
        console.error('Failed to load communication dashboard', err);
        this.loadNotifications();
      }
    });

    this.communicationService.getMessages().subscribe({
      next: list => {
        this.messages = (list || [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map(m => ({
            sender: `User #${m.sender_id}`,
            subject: m.message,
            date: m.created_at ? new Date(m.created_at).toLocaleString() : '-',
            status: m.is_read ? 'Read' : 'Unread'
          }));
        this.dataSource.data = this.messages;
        this.cdr.detectChanges();
      },
      error: err => console.error('Failed to load recent messages', err)
    });

    this.communicationService.getContracts().subscribe({
      next: rows => this.contractsCount = (rows || []).length,
      error: () => this.contractsCount = 0
    });

    this.communicationService.getInvoices().subscribe({
      next: rows => this.invoicesCount = (rows || []).length,
      error: () => this.invoicesCount = 0
    });

    this.communicationService.getComplianceRecords().subscribe({
      next: rows => this.complianceDocsCount = (rows || []).length,
      error: () => this.complianceDocsCount = 0
    });

    this.communicationService.getStoredNotifications().subscribe({
      next: rows => {
        this.totalNotifications = (rows || []).length;
        this.notifications = (rows || []).slice(0, 5).map((n: any) =>
          `${n.title || 'Notification'}: ${n.description || ''}`.trim()
        );
        this.cdr.detectChanges();
      },
      error: () => this.totalNotifications = 0
    });
  }

  private loadNotifications(): void {
    this.communicationService.getStoredNotifications().subscribe({
      next: rows => {
        this.totalNotifications = (rows || []).length;
        this.notifications = (rows || []).slice(0, 5).map((n: any) =>
          `${n.title || 'Notification'}: ${n.description || ''}`.trim()
        );
        this.cdr.detectChanges();
      },
      error: () => this.totalNotifications = 0
    });
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  viewMessage(row: any): void {
    this.router.navigate(['/vendor-messaging']);
  }

  openModule(module: string): void {
    const routes: Record<string, string> = {
      'Vendor Messaging': '/vendor-messaging',
      'Procurement Discussions': '/procurement-discussions',
      'File Sharing': '/file-sharing',
      'Communication History': '/communication-history',
      'Notifications': '/communication-notifications',
      'Activity Logs': '/activity-logs'
    };
    const route = routes[module];
    if (route) this.router.navigate([route]);
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }
}
