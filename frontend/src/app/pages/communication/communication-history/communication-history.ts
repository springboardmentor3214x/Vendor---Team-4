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
  selector: 'app-communication-history',
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
  templateUrl: './communication-history.html',
  styleUrl: './communication-history.scss'
})
export class CommunicationHistory implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalRecords = 0;
  totalVendors = 0;
  totalDiscussions = 0;
  documentExchanges = 0;

  vendors: string[] = [];
  displayedColumns = [
    'recordId',
    'vendor',
    'recordType',
    'discussionTitle',
    'lastActivity',
    'documents',
    'status',
    'actions'
  ];

  communicationRecords: any[] = [];
  dataSource = new MatTableDataSource<any>();
  selectedRecord: any = null;
  documentHistory: any[] = [];

  private vendorsData: any[] = [];

  constructor(
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadReferenceData(): void {
    this.communicationService.getVendors().subscribe({
      next: vendors => {
        this.vendorsData = vendors || [];
        this.vendors = this.vendorsData.map(v => v.company_name).filter(Boolean);
        this.loadHistory();
      },
      error: () => this.loadHistory()
    });
  }

  loadHistory(): void {
    this.communicationService.getCommunicationHistory().subscribe({
      next: data => {
        this.communicationService.getFileShares().subscribe({
          next: files => this.applyHistory(data || [], files || []),
          error: () => this.applyHistory(data || [], [])
        });
      },
      error: err => {
        console.error('Failed to load communication history', err);
        this.applyHistory([], []);
      }
    });
  }

  private applyHistory(data: any[], files: any[]): void {
    this.communicationRecords = data.map(item => {
      const poId = item.purchase_order_id;
      const vendor = this.vendorsData.find(v => Number(v.id) === Number(item.vendor_id));
      const linkedFiles = files.filter(f =>
        Number(f.purchase_order_id) === Number(poId) ||
        Number(f.discussion_id) === Number(item.reference_id)
      );

      const isDiscussion = String(item.type).toLowerCase() === 'discussion';
      return {
        recordId: isDiscussion ? `DISC-${item.reference_id}` : `MSG-${item.reference_id}`,
        vendor: vendor?.company_name || (poId ? `PO #${poId}` : 'N/A'),
        recordType: poId ? 'Purchase Order' : (isDiscussion ? 'Procurement Discussion' : 'Vendor Messaging'),
        discussionTitle: item.title || (isDiscussion ? 'Procurement Discussion' : 'Direct Message'),
        lastActivity: item.created_at ? new Date(item.created_at).toLocaleString() : '-',
        documents: linkedFiles.length,
        status: isDiscussion ? (String(item.status || '').toUpperCase() === 'CLOSED' ? 'Closed' : 'Open') : 'Open',
        raw: item
      };
    });

    this.documentHistory = files.map(file => ({
      id: file.id,
      fileName: file.file_name,
      fileType: file.file_type,
      recordId: file.purchase_order_id ? `PO-${file.purchase_order_id}` : `FILE-${file.id}`
    }));

    this.totalRecords = this.communicationRecords.length;
    this.totalVendors = new Set(this.communicationRecords.map(r => r.vendor).filter(v => v && v !== 'N/A')).size;
    this.totalDiscussions = data.filter(i => String(i.type).toLowerCase() === 'discussion').length;
    this.documentExchanges = files.length;

    this.dataSource.data = [...this.communicationRecords];
    this.selectedRecord = this.communicationRecords[0] || null;
    this.cdr.detectChanges();
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  filterByVendor(vendor: string): void {
    this.dataSource.data = vendor === 'all'
      ? this.communicationRecords
      : this.communicationRecords.filter(r => r.vendor === vendor);
  }

  filterByRecordType(type: string): void {
    this.dataSource.data = type === 'all'
      ? this.communicationRecords
      : this.communicationRecords.filter(r => r.recordType === type);
  }

  filterByStatus(status: string): void {
    this.dataSource.data = status === 'all'
      ? this.communicationRecords
      : this.communicationRecords.filter(r => r.status === status);
  }

  selectRecord(record: any): void {
    this.selectedRecord = record;
  }

  viewRecord(record: any): void {
    this.selectedRecord = record;
  }

  openHistory(record: any): void {
    if (record?.recordType === 'Purchase Order') {
      this.communicationService.getCommunicationHistory().subscribe();
    }
  }

  exportHistory(): void {
    const rows = this.communicationRecords.map(r => [
      r.recordId,
      r.vendor,
      r.recordType,
      r.discussionTitle,
      r.lastActivity,
      r.documents,
      r.status
    ]);
    const csv = [
      'Record ID,Vendor,Record Type,Subject,Last Activity,Documents,Status',
      ...rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Communication_History.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  refreshHistory(): void {
    this.loadHistory();
  }

  previewDocument(file: any): void {
    if (file?.id) {
      this.communicationService.downloadSharedFile(file.id).subscribe({
        next: blob => window.open(URL.createObjectURL(blob), '_blank'),
        error: err => alert(err?.error?.detail || 'Unable to preview document.')
      });
    }
  }

  downloadDocument(file: any): void {
    if (!file?.id) return;
    this.communicationService.downloadSharedFile(file.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName || 'document';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => alert(err?.error?.detail || 'Download failed.')
    });
  }
}
