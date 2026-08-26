import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommunicationService } from '../../../services/communication.service';

@Component({
  selector: 'app-procurement-discussions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './procurement-discussions.html',
  styleUrl: './procurement-discussions.scss'
})
export class ProcurementDiscussions implements OnInit {
  totalDiscussions = 0;
  activeDiscussions = 0;
  totalParticipants = 0;
  linkedRecords = 0;

  newReply = '';
  selectedFileName = '';

  discussions: any[] = [];
  filteredDiscussions: any[] = [];
  selectedDiscussion: any = null;
  discussionMessages: any[] = [];
  linkedDocuments: any[] = [];

  showNewDiscussionModal = false;
  discussionForm!: FormGroup;

  vendorsList: string[] = [];
  purchaseOrders: any[] = [];
  private currentUserId = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReferenceData();
  }

  private initForm(): void {
    this.discussionForm = this.fb.group({
      title: ['', Validators.required],
      vendor: ['', Validators.required],
      recordType: ['Purchase Order', Validators.required],
      recordId: ['', Validators.required],
      initialMessage: ['', Validators.required]
    });
  }

  private loadReferenceData(): void {
    this.communicationService.getCurrentUser().subscribe({
      next: user => {
        this.currentUserId = Number(user.id);
        this.communicationService.getPurchaseOrders().subscribe({
          next: pos => {
            this.purchaseOrders = pos || [];
            this.vendorsList = Array.from(new Set(
              this.purchaseOrders.map(po => po.vendor_name).filter(Boolean)
            ));
            if (this.purchaseOrders.length) {
              const po = this.purchaseOrders[0];
              this.discussionForm.patchValue({
                vendor: po.vendor_name || '',
                recordId: po.po_number
              });
            }
            this.loadDiscussions();
          },
          error: err => {
            console.error('Failed to load purchase orders', err);
            this.loadDiscussions();
          }
        });
      },
      error: err => console.error('Failed to load current user', err)
    });
  }

  loadDiscussions(): void {
    this.communicationService.getDiscussions().subscribe({
      next: data => {
        const fetched = (data || []).map(d => {
          const po = this.purchaseOrders.find(p => Number(p.id) === Number(d.purchase_order_id));
          return {
            id: d.id,
            title: d.title,
            vendor: po?.vendor_name || `Vendor #${po?.vendor_id ?? '-'}`,
            recordType: 'Purchase Order',
            recordId: po?.po_number || `PO #${d.purchase_order_id}`,
            status: this.toUiStatus(d.status),
            participants: 2,
            totalMessages: d.replies_count || 0,
            lastUpdated: this.formatDate(d.created_at),
            lastMessage: d.description,
            categories: ['Procurement', 'Purchase Order'],
            participantList: [
              { name: `User #${d.created_by}`, role: 'Participant' }
            ],
            purchaseOrderId: Number(d.purchase_order_id),
            description: d.description
          };
        });

        this.discussions = fetched;
        this.filteredDiscussions = [...fetched];
        this.updateStats();

        if (this.selectedDiscussion) {
          const refreshed = fetched.find(d => d.id === this.selectedDiscussion.id);
          this.selectedDiscussion = refreshed || null;
        }
        if (!this.selectedDiscussion && fetched.length) {
          this.selectDiscussion(fetched[0]);
        } else if (!fetched.length) {
          this.discussionMessages = [];
          this.linkedDocuments = [];
        }

        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load discussions', err);
        this.discussions = [];
        this.filteredDiscussions = [];
        this.updateStats();
        this.cdr.detectChanges();
      }
    });
  }

  private toUiStatus(status: string): string {
    return String(status || '').toUpperCase() === 'CLOSED' ? 'Resolved' : 'Open';
  }

  private formatDate(value: string): string {
    return value ? new Date(value).toLocaleString() : '-';
  }

  updateStats(): void {
    this.totalDiscussions = this.discussions.length;
    this.activeDiscussions = this.discussions.filter(d => d.status === 'Open').length;
    this.totalParticipants = new Set(
      this.discussions.flatMap(d => (d.participantList || []).map((p: any) => p.name))
    ).size;
    this.linkedRecords = this.discussions.filter(d => !!d.purchaseOrderId).length;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredDiscussions = this.discussions.filter(d =>
      String(d.title).toLowerCase().includes(value) ||
      String(d.vendor).toLowerCase().includes(value) ||
      String(d.recordId).toLowerCase().includes(value)
    );
  }

  filterByRecordType(type: string): void {
    this.filteredDiscussions = type === 'all'
      ? [...this.discussions]
      : this.discussions.filter(d => d.recordType === type);
  }

  filterByStatus(status: string): void {
    this.filteredDiscussions = status === 'all'
      ? [...this.discussions]
      : this.discussions.filter(d => d.status === status);
  }

  selectDiscussion(discussion: any): void {
    this.selectedDiscussion = discussion;
    this.loadReplies(discussion.id);
    this.loadLinkedDocuments(discussion.id);
  }

  loadReplies(discussionId: number): void {
    this.communicationService.getDiscussionReplies(discussionId).subscribe({
      next: replies => {
        this.discussionMessages = (replies || []).map(r => ({
          user: r.user_name || `User #${r.user_id}`,
          role: r.user_role || 'Participant',
          timestamp: this.formatDate(r.created_at),
          message: r.comment
        }));
        const target = this.discussions.find(d => d.id === discussionId);
        if (target) {
          target.totalMessages = this.discussionMessages.length;
          target.lastMessage = this.discussionMessages.at(-1)?.message || target.description;
          target.lastUpdated = this.discussionMessages.at(-1)?.timestamp || target.lastUpdated;
        }
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load discussion replies', err);
        this.discussionMessages = [];
        this.cdr.detectChanges();
      }
    });
  }

  private loadLinkedDocuments(discussionId: number): void {
    this.communicationService.getFileShares().subscribe({
      next: files => {
        this.linkedDocuments = (files || [])
          .filter(f => Number(f.discussion_id) === Number(discussionId))
          .map(f => ({
            id: f.id,
            fileName: f.file_name,
            fileType: f.file_type || 'Document'
          }));
        this.cdr.detectChanges();
      },
      error: err => console.error('Failed to load linked files', err)
    });
  }

  submitReply(): void {
    const text = this.newReply.trim();
    if (!text || !this.selectedDiscussion) return;

    this.communicationService.addDiscussionReply(this.selectedDiscussion.id, text).subscribe({
      next: () => {
        this.newReply = '';
        this.loadReplies(this.selectedDiscussion.id);
      },
      error: err => alert(err?.error?.detail || 'Reply could not be saved.')
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFileName = file.name;

    const discussionId = this.selectedDiscussion?.id;
    if (!discussionId) {
      alert('Select a discussion before attaching a file.');
      return;
    }

    this.communicationService.uploadSharedFile(file, {
      discussion_id: discussionId,
      purchase_order_id: this.selectedDiscussion.purchaseOrderId
    }).subscribe({
      next: saved => {
        this.selectedFileName = '';
        this.linkedDocuments.push({
          id: saved.id,
          fileName: saved.file_name,
          fileType: saved.file_type || 'Document'
        });
        this.cdr.detectChanges();
      },
      error: err => {
        this.selectedFileName = '';
        alert(err?.error?.detail || 'File upload failed.');
      }
    });
  }

  previewDocument(doc: any): void {
    if (doc.id) {
      this.communicationService.downloadSharedFile(doc.id).subscribe({
        next: blob => this.previewBlob(blob, doc.fileName),
        error: err => alert(err?.error?.detail || 'Unable to preview file.')
      });
    }
  }

  private previewBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  downloadDocument(doc: any): void {
    if (!doc.id) return;
    this.communicationService.downloadSharedFile(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName || 'document';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => alert(err?.error?.detail || 'Download failed.')
    });
  }

  openNewDiscussionModal(): void {
    if (!this.purchaseOrders.length) {
      alert('No purchase orders are available. Create a purchase order first.');
      return;
    }
    const po = this.purchaseOrders[0];
    this.discussionForm.reset({
      title: '',
      vendor: po.vendor_name || '',
      recordType: 'Purchase Order',
      recordId: po.po_number,
      initialMessage: ''
    });
    this.showNewDiscussionModal = true;
  }

  closeNewDiscussionModal(): void {
    this.showNewDiscussionModal = false;
  }

  submitNewDiscussion(): void {
    if (this.discussionForm.invalid) {
      this.discussionForm.markAllAsTouched();
      return;
    }

    const val = this.discussionForm.value;
    if (val.recordType !== 'Purchase Order') {
      alert('Procurement discussions must be linked to a Purchase Order.');
      return;
    }

    const po = this.purchaseOrders.find(p => p.po_number === val.recordId);
    if (!po) {
      alert('Select a valid Purchase Order.');
      return;
    }

    this.communicationService.createDiscussion({
      title: val.title,
      description: val.initialMessage,
      purchase_order_id: Number(po.id)
    }).subscribe({
      next: created => {
        this.showNewDiscussionModal = false;
        this.loadDiscussions();
        alert(`Discussion "${created.title}" created successfully.`);
      },
      error: err => alert(err?.error?.detail || 'Discussion could not be created.')
    });
  }

  createDiscussion(): void {
    this.openNewDiscussionModal();
  }

  refreshDiscussions(): void {
    this.loadDiscussions();
  }

  closeDiscussion(): void {
    if (!this.selectedDiscussion) return;

    if (!confirm(`Close "${this.selectedDiscussion.title}"?`)) return;

    const d = this.selectedDiscussion;
    this.communicationService.updateDiscussion(d.id, {
      title: d.title,
      description: d.description,
      status: 'CLOSED'
    }).subscribe({
      next: () => this.loadDiscussions(),
      error: err => alert(err?.error?.detail || 'Discussion could not be closed.')
    });
  }

  escalateIssue(): void {
    if (!this.selectedDiscussion) return;
    this.communicationService.updateDiscussion(this.selectedDiscussion.id, {
      title: this.selectedDiscussion.title,
      description: `${this.selectedDiscussion.description}\n\nEscalated by current user.`,
      status: 'OPEN'
    }).subscribe({
      next: () => this.loadDiscussions(),
      error: err => alert(err?.error?.detail || 'Discussion could not be escalated.')
    });
  }

  viewLinkedRecord(): void {
    if (this.selectedDiscussion) {
      this.router.navigate(['/purchase-orders']);
    }
  }

  viewDiscussionHistory(): void {
    if (this.selectedDiscussion) {
      this.router.navigate(['/communication-history']);
    }
  }
}
