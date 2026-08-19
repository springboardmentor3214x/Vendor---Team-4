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
  selector: 'app-file-sharing',
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
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './file-sharing.html',
  styleUrl: './file-sharing.scss'
})
export class FileSharing implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalFiles = 0;
  pdfFiles = 0;
  documentFiles = 0;
  totalDownloads = 0;
  excelFiles = 0;
  wordFiles = 0;
  imageFiles = 0;
  zipFiles = 0;

  selectedFileName = '';
  selectedFileObj: File | null = null;

  vendors: string[] = [];
  purchaseOrders: string[] = [];
  contracts: string[] = [];
  discussions: string[] = [];

  private vendorRecords: any[] = [];
  private purchaseOrderRecords: any[] = [];
  private contractRecords: any[] = [];
  private discussionRecords: any[] = [];

  selectedVendor = '';
  selectedPurchaseOrder = '';
  selectedContract = '';
  selectedDiscussion = '';

  isGridView = false;
  showPreviewModal = false;
  previewingFile: any = null;

  displayedColumns = [
    'fileName',
    'fileType',
    'linkedEntity',
    'uploadedBy',
    'uploadDate',
    'size',
    'downloads',
    'actions'
  ];

  repositoryFiles: any[] = [];
  dataSource = new MatTableDataSource<any>();
  selectedFile: any = null;

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
        this.vendorRecords = vendors || [];
        this.vendors = this.vendorRecords.map(v => v.company_name).filter(Boolean);
        this.communicationService.getPurchaseOrders().subscribe({
          next: pos => {
            this.purchaseOrderRecords = pos || [];
            this.purchaseOrders = this.purchaseOrderRecords.map(p => p.po_number).filter(Boolean);
            this.communicationService.getContracts().subscribe({
              next: contracts => {
                this.contractRecords = contracts || [];
                this.contracts = this.contractRecords.map(c => c.contract_number).filter(Boolean);
                this.communicationService.getDiscussions().subscribe({
                  next: discussions => {
                    this.discussionRecords = discussions || [];
                    this.discussions = this.discussionRecords.map(d => `DISC-${d.id}`);
                    this.loadFiles();
                  },
                  error: () => this.loadFiles()
                });
              },
              error: () => this.loadFiles()
            });
          },
          error: () => this.loadFiles()
        });
      },
      error: () => this.loadFiles()
    });
  }

  loadFiles(): void {
    this.communicationService.getFileShares().subscribe({
      next: data => {
        this.repositoryFiles = (data || []).map(item => this.mapFile(item));
        this.refreshTable();
      },
      error: err => {
        console.error('Failed to load shared files', err);
        this.repositoryFiles = [];
        this.refreshTable();
      }
    });
  }

  private mapFile(item: any): any {
    const vendor = this.vendorRecords.find(v => Number(v.id) === Number(item.vendor_id));
    const po = this.purchaseOrderRecords.find(p => Number(p.id) === Number(item.purchase_order_id));
    const discussion = this.discussionRecords.find(d => Number(d.id) === Number(item.discussion_id));
    const linkedParts: string[] = [];
    if (vendor) linkedParts.push(`Vendor (${vendor.company_name})`);
    if (po) linkedParts.push(`Purchase Order (${po.po_number})`);
    if (item.discussion_id) linkedParts.push(`Discussion (DISC-${item.discussion_id})`);
    const contract = this.contractRecords.find(c => Number(c.id) === Number(item.contract_id));
    if (contract) linkedParts.push(`Contract (${contract.contract_number})`);

    const extension = String(item.file_type || item.file_name?.split('.').pop() || 'DOCUMENT').toUpperCase();
    const fileType = ['XLS', 'XLSX'].includes(extension) ? 'EXCEL' :
      ['DOC', 'DOCX'].includes(extension) ? 'WORD' :
      ['PNG', 'JPG', 'JPEG'].includes(extension) ? 'IMAGE' :
      extension === 'PDF' ? 'PDF' :
      ['ZIP', 'RAR'].includes(extension) ? 'ZIP' : extension;

    return {
      id: item.id,
      fileName: item.file_name,
      fileType,
      linkedEntity: linkedParts.join(', ') || 'Unlinked',
      uploadedBy: `User #${item.uploaded_by}`,
      uploadDate: item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : '-',
      size: item.file_size ? this.formatBytes(item.file_size) : '-',
      downloads: 0,
      raw: item,
      vendorId: vendor?.id,
      purchaseOrderId: po?.id,
      discussionId: discussion?.id,
      contractId: contract?.id
    };
  }

  private refreshTable(): void {
    this.dataSource.data = [...this.repositoryFiles];
    if (this.repositoryFiles.length && !this.selectedFile) {
      this.selectedFile = this.repositoryFiles[0];
    } else if (this.selectedFile) {
      this.selectedFile = this.repositoryFiles.find(f => f.id === this.selectedFile.id) || null;
    }
    this.totalFiles = this.repositoryFiles.length;
    this.pdfFiles = this.repositoryFiles.filter(f => f.fileType === 'PDF').length;
    this.excelFiles = this.repositoryFiles.filter(f => f.fileType === 'EXCEL').length;
    this.wordFiles = this.repositoryFiles.filter(f => f.fileType === 'WORD').length;
    this.imageFiles = this.repositoryFiles.filter(f => f.fileType === 'IMAGE').length;
    this.zipFiles = this.repositoryFiles.filter(f => f.fileType === 'ZIP').length;
    this.documentFiles = this.repositoryFiles.length;
    this.totalDownloads = this.repositoryFiles.reduce((sum, f) => sum + Number(f.downloads || 0), 0);
    this.cdr.detectChanges();
  }

  private formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFileObj = input.files?.[0] || null;
    this.selectedFileName = this.selectedFileObj?.name || '';
  }

  uploadFile(): void {
    if (!this.selectedFileObj) {
      alert('Select a file first.');
      return;
    }

    const vendor = this.vendorRecords.find(v => v.company_name === this.selectedVendor);
    const po = this.purchaseOrderRecords.find(p => p.po_number === this.selectedPurchaseOrder);
    const discussion = this.discussionRecords.find(d => `DISC-${d.id}` === this.selectedDiscussion);

    this.communicationService.uploadSharedFile(this.selectedFileObj, {
      vendor_id: vendor?.id || null,
      purchase_order_id: po?.id || null,
      discussion_id: discussion?.id || null,
      contract_id: this.contractRecords.find(c => c.contract_number === this.selectedContract)?.id || null
    }).subscribe({
      next: () => {
        this.selectedFileName = '';
        this.selectedFileObj = null;
        this.loadFiles();
        alert('File uploaded successfully.');
      },
      error: err => alert(err?.error?.detail || 'File upload failed.')
    });
  }

  openUploadDialog(): void {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    input?.click();
  }

  toggleRepositoryView(): void {
    this.isGridView = !this.isGridView;
    setTimeout(() => this.cdr.detectChanges());
  }

  applyFilter(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  filterByFileType(fileType: string): void {
    this.dataSource.data = fileType === 'all'
      ? this.repositoryFiles
      : this.repositoryFiles.filter(file => file.fileType === fileType.toUpperCase());
  }

  filterByEntity(entity: string): void {
    this.dataSource.data = entity === 'all'
      ? this.repositoryFiles
      : this.repositoryFiles.filter(file => file.linkedEntity.includes(entity));
  }

  selectFile(file: any): void {
    this.selectedFile = file;
  }

  previewFile(file: any): void {
    this.selectedFile = file;
    this.previewingFile = file;
    this.showPreviewModal = true;
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.previewingFile = null;
  }

  downloadFile(file: any): void {
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
      error: err => alert(err?.error?.detail || 'File download failed.')
    });
  }

  deleteFile(file: any): void {
    if (!file?.id || !confirm(`Delete ${file.fileName}?`)) return;
    this.communicationService.deleteSharedFile(file.id).subscribe({
      next: () => {
        this.selectedFile = null;
        this.loadFiles();
      },
      error: err => alert(err?.error?.detail || 'File could not be deleted.')
    });
  }

  refreshFiles(): void {
    this.loadFiles();
  }
}
