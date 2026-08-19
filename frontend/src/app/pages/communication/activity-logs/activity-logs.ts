import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-activity-logs',
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
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './activity-logs.html',
  styleUrl: './activity-logs.scss'
})
export class ActivityLogs implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalActivities = 0;
  messageActivities = 0;
  fileActivities = 0;
  activeUsers = 0;

  authenticatedActivities = 0;
  adminActivities = 0;
  flaggedEvents = 0;
  secureOperations = 0;

  displayedColumns = [
    'userId',
    'userName',
    'role',
    'action',
    'module',
    'businessRecord',
    'timestamp',
    'ipAddress',
    'status',
    'actions'
  ];

  activityLogs: any[] = [];
  dataSource = new MatTableDataSource<any>();
  selectedLog: any = null;
  recentActivities: any[] = [];

  constructor(
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadActivityLogs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadActivityLogs(): void {
    this.communicationService.getActivityLogs().subscribe({
      next: data => {
        this.activityLogs = (data || []).map(item => ({
          userId: `USR${String(item.user_id).padStart(3, '0')}`,
          userName: `User #${item.user_id}`,
          role: 'User',
          action: item.activity_type || 'Activity',
          module: this.getModule(item.activity_type),
          businessRecord: item.description || '-',
          timestamp: item.created_at ? new Date(item.created_at).toLocaleString() : '-',
          ipAddress: '-',
          status: 'Recorded',
          raw: item
        }));

        this.updateStats();
        this.dataSource.data = [...this.activityLogs];
        this.selectedLog = this.activityLogs[0] || null;
        this.recentActivities = this.activityLogs.slice(0, 5).map(log => ({
          action: log.action,
          description: log.businessRecord,
          time: log.timestamp
        }));
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load activity logs', err);
        this.activityLogs = [];
        this.updateStats();
        this.dataSource.data = [];
        this.selectedLog = null;
        this.recentActivities = [];
        this.cdr.detectChanges();
      }
    });
  }

  private getModule(activityType: string): string {
    const value = String(activityType || '').toLowerCase();
    if (value.includes('message')) return 'Vendor Messaging';
    if (value.includes('discussion')) return 'Procurement Discussions';
    if (value.includes('file')) return 'File Sharing';
    return 'Communication';
  }

  private updateStats(): void {
    this.totalActivities = this.activityLogs.length;
    this.messageActivities = this.activityLogs.filter(l =>
      String(l.action).toLowerCase().includes('message')
    ).length;
    this.fileActivities = this.activityLogs.filter(l =>
      String(l.action).toLowerCase().includes('file')
    ).length;
    this.activeUsers = new Set(this.activityLogs.map(l => l.raw?.user_id)).size;
    this.authenticatedActivities = this.activityLogs.length;
    this.adminActivities = this.activityLogs.filter(l => l.role === 'Administrator').length;
    this.flaggedEvents = this.activityLogs.filter(l =>
      String(l.action).toLowerCase().includes('flag')
    ).length;
    this.secureOperations = this.activityLogs.filter(l =>
      ['delete', 'read', 'upload', 'download'].some(x =>
        String(l.action).toLowerCase().includes(x)
      )
    ).length;
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  filterByActivity(activity: string): void {
    this.dataSource.data = activity === 'all'
      ? this.activityLogs
      : this.activityLogs.filter(log => log.action === activity);
  }

  filterByModule(module: string): void {
    this.dataSource.data = module === 'all'
      ? this.activityLogs
      : this.activityLogs.filter(log => log.module === module);
  }

  filterByRole(role: string): void {
    this.dataSource.data = role === 'all'
      ? this.activityLogs
      : this.activityLogs.filter(log => log.role === role);
  }

  selectLog(log: any): void {
    this.selectedLog = log;
  }

  viewLogDetails(log: any): void {
    this.selectedLog = log;
  }

  exportLogs(): void {
    const rows = this.activityLogs.map(l => [
      l.userId, l.userName, l.role, l.action, l.module,
      l.businessRecord, l.timestamp, l.ipAddress, l.status
    ]);
    const csv = [
      'User ID,User Name,Role,Action,Module,Business Record,Timestamp,IP Address,Status',
      ...rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Communication_Activity_Logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  refreshLogs(): void {
    this.loadActivityLogs();
  }
}
