import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommunicationService } from '../../../services/communication.service';

@Component({
  selector: 'app-vendor-messaging',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './vendor-messaging.html',
  styleUrl: './vendor-messaging.scss'
})
export class VendorMessaging implements OnInit {
  totalConversations = 0;
  unreadMessages = 0;
  activeVendors = 0;
  linkedActivities = 0;

  newMessage = '';
  selectedFileName = '';
  selectedFileObj: File | null = null;

  conversations: any[] = [];
  filteredConversations: any[] = [];
  selectedConversation: any = null;
  messages: any[] = [];
  attachments: any[] = [];

  private currentUserId = 0;
  contacts: any[] = [];
  private purchaseOrders: any[] = [];
  private allFiles: any[] = [];

  constructor(
    private communicationService: CommunicationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.communicationService.getCurrentUser().subscribe({
      next: user => {
        this.currentUserId = Number(user?.id || 0);
        this.loadContactsAndReferences();
      },
      error: err => {
        console.error('Unable to load current user', err);
        alert('Unable to load the logged-in user. Please log in again.');
      }
    });
  }

  private loadContactsAndReferences(): void {
    this.communicationService.getContacts().subscribe({
      next: contacts => {
        this.contacts = contacts || [];
        this.communicationService.getPurchaseOrders().subscribe({
          next: pos => {
            this.purchaseOrders = pos || [];
            this.communicationService.getFileShares().subscribe({
              next: files => {
                this.allFiles = files || [];
                this.loadConversations();
              },
              error: () => this.loadConversations()
            });
          },
          error: () => this.loadConversations()
        });
      },
      error: err => {
        console.error('Failed to load contacts', err);
        this.contacts = [];
        this.loadConversations();
      }
    });
  }

  private loadConversations(): void {
    this.communicationService.getMessages().subscribe({
      next: data => {
        const messages = data || [];
        const grouped = new Map<number, any>();

        messages.forEach(m => {
          const senderId = Number(m.sender_id);
          const receiverId = Number(m.receiver_id);
          const otherId = senderId === this.currentUserId ? receiverId : senderId;

          if (!otherId || otherId === this.currentUserId) return;

          const contact = this.contacts.find(c => Number(c.id) === otherId);
          const existing = grouped.get(otherId);

          if (!existing) {
            grouped.set(otherId, this.createConversation(contact, otherId));
          }

          const row = grouped.get(otherId)!;
          row.totalMessages += 1;

          if (receiverId === this.currentUserId && !m.is_read) {
            row.unreadCount += 1;
          }

          if (!row.lastRaw || new Date(m.created_at).getTime() >= new Date(row.lastMessageDate).getTime()) {
            row.lastMessage = m.message;
            row.lastMessageDate = m.created_at;
            row.lastMessageTime = this.formatDate(m.created_at);
            row.relatedType = m.purchase_order_id ? 'Purchase Order' : 'Direct Message';
            row.relatedRecord = this.getPoNumber(m.purchase_order_id);
            row.relatedPurchaseOrderId = m.purchase_order_id || null;
            row.lastRaw = m;
          }
        });

        this.conversations = Array.from(grouped.values())
          .sort((a, b) =>
            new Date(b.lastMessageDate).getTime() -
            new Date(a.lastMessageDate).getTime()
          );

        this.filteredConversations = [...this.conversations];
        this.totalConversations = this.conversations.length;
        this.unreadMessages = this.conversations.reduce(
          (sum, conversation) => sum + Number(conversation.unreadCount || 0),
          0
        );
        this.activeVendors = this.contacts.filter(
          c => String(c.role || '').toLowerCase() === 'vendor'
        ).length;
        this.linkedActivities = messages.filter(m => !!m.purchase_order_id).length;

        if (this.selectedConversation) {
          const same = this.conversations.find(
            c => Number(c.vendorId) === Number(this.selectedConversation.vendorId)
          );

          if (same) {
            this.selectedConversation = same;
            this.selectConversation(same);
          } else {
            // Keep a newly selected contact available even before the first message.
            this.refreshSelectedContactState();
          }
        }

        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load messages', err);
        this.conversations = [];
        this.filteredConversations = [];
        this.totalConversations = 0;
        this.unreadMessages = 0;
        this.linkedActivities = 0;
        this.cdr.detectChanges();
      }
    });
  }

  private createConversation(contact: any, userId: number): any {
    return {
      vendorId: Number(userId),
      vendorName: contact?.company_name || contact?.name || `User #${userId}`,
      vendorType: contact?.role || 'User',
      contactPerson: contact?.name || `User #${userId}`,
      email: contact?.email || '-',
      lastMessage: 'No messages yet. Start the conversation.',
      lastMessageDate: '1970-01-01T00:00:00.000Z',
      lastMessageTime: '-',
      unreadCount: 0,
      relatedType: 'Direct Message',
      relatedRecord: '-',
      relatedPurchaseOrderId: null,
      activityStatus: 'Ready',
      totalMessages: 0,
      category: contact?.role || 'User',
      categories: contact?.role ? [contact.role] : ['User'],
      lastRaw: null
    };
  }

  private refreshSelectedContactState(): void {
    if (!this.selectedConversation) return;

    const contact = this.contacts.find(
      c => Number(c.id) === Number(this.selectedConversation.vendorId)
    );

    if (contact) {
      const existing = this.conversations.find(
        c => Number(c.vendorId) === Number(contact.id)
      );
      this.selectedConversation = existing || this.createConversation(contact, Number(contact.id));
    }

    this.loadSelectedConversationData();
  }

  private getPoNumber(id: number | null | undefined): string {
    if (!id) return '-';
    return this.purchaseOrders.find(
      po => Number(po.id) === Number(id)
    )?.po_number || `PO #${id}`;
  }

  private formatDate(value: string): string {
    return value ? new Date(value).toLocaleString() : '-';
  }

  applyConversationFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.filteredConversations = this.conversations.filter(c =>
      String(c.vendorName).toLowerCase().includes(value) ||
      String(c.vendorType).toLowerCase().includes(value) ||
      String(c.lastMessage).toLowerCase().includes(value) ||
      String(c.relatedRecord).toLowerCase().includes(value)
    );
  }

  /**
   * Start a conversation with a real database user/vendor even when no
   * previous message exists. This fixes the "0 conversations" dead-end.
   */
  startConversation(contact: any): void {
    if (!contact?.id) return;

    const existing = this.conversations.find(
      c => Number(c.vendorId) === Number(contact.id)
    );

    this.selectedConversation =
      existing || this.createConversation(contact, Number(contact.id));

    this.messages = [];
    this.attachments = [];
    this.loadSelectedConversationData();
    this.cdr.detectChanges();
  }

  selectConversation(conversation: any): void {
    if (!conversation?.vendorId) return;

    this.selectedConversation = conversation;
    this.loadSelectedConversationData();
  }

  private loadSelectedConversationData(): void {
    if (!this.selectedConversation) return;

    const otherUserId = Number(this.selectedConversation.vendorId);

    this.communicationService.getConversation(otherUserId).subscribe({
      next: data => {
        const rows = data || [];

        this.messages = rows.map(m => ({
          id: m.id,
          sender: Number(m.sender_id) === this.currentUserId
            ? 'You'
            : (this.contacts.find(c => Number(c.id) === Number(m.sender_id))?.name ||
               this.selectedConversation.vendorName),
          senderType: Number(m.sender_id) === this.currentUserId ? 'Organization' : 'Vendor',
          timestamp: this.formatDate(m.created_at),
          content: m.message,
          readStatus: m.is_read ? 'Read' : 'Unread',
          relatedActivity: m.purchase_order_id
            ? this.getPoNumber(m.purchase_order_id)
            : 'Direct Message',
          senderId: Number(m.sender_id),
          receiverId: Number(m.receiver_id),
          raw: m
        }));

        const unread = rows.filter(m =>
          Number(m.receiver_id) === this.currentUserId && !m.is_read
        );

        unread.forEach(m => {
          this.communicationService.markMessageRead(Number(m.id)).subscribe({
            next: () => undefined,
            error: err => console.error('Failed to mark message read', err)
          });
        });

        const last = rows.length ? rows[rows.length - 1] : null;
        if (last) {
          this.selectedConversation.lastMessage = last.message;
          this.selectedConversation.lastMessageDate = last.created_at;
          this.selectedConversation.lastMessageTime = this.formatDate(last.created_at);
          this.selectedConversation.relatedType = last.purchase_order_id
            ? 'Purchase Order'
            : 'Direct Message';
          this.selectedConversation.relatedRecord = this.getPoNumber(last.purchase_order_id);
          this.selectedConversation.relatedPurchaseOrderId = last.purchase_order_id || null;
          this.selectedConversation.totalMessages = rows.length;
        } else {
          this.selectedConversation.lastMessage = 'No messages yet. Start the conversation.';
          this.selectedConversation.totalMessages = 0;
          this.selectedConversation.relatedRecord = '-';
          this.selectedConversation.relatedPurchaseOrderId = null;
        }

        this.selectedConversation.unreadCount = 0;
        this.attachments = this.getConversationFiles(this.selectedConversation);
        this.unreadMessages = this.conversations.reduce(
          (sum, c) => sum + Number(c.unreadCount || 0),
          0
        );

        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load conversation', err);
        this.messages = [];
        this.attachments = [];
        this.cdr.detectChanges();
      }
    });
  }

  private getConversationFiles(conversation: any): any[] {
    const vendorId = Number(conversation?.vendorId || 0);
    const poId = Number(conversation?.relatedPurchaseOrderId || 0);

    return this.allFiles
      .filter(file =>
        (vendorId && Number(file.vendor_id) === vendorId) ||
        (poId && Number(file.purchase_order_id) === poId)
      )
      .map(file => ({
        id: file.id,
        fileName: file.file_name,
        fileType: file.file_type,
        raw: file
      }));
  }

  sendMessage(): void {
    const content = this.newMessage.trim();

    if (!content || !this.selectedConversation?.vendorId) {
      if (!this.selectedConversation) {
        alert('Select a vendor/contact first.');
      } else {
        alert('Enter a message first.');
      }
      return;
    }

    const poId = Number(this.selectedConversation.relatedPurchaseOrderId || 0) || null;

    const send = () => {
      this.communicationService.sendMessage({
        receiver_id: Number(this.selectedConversation.vendorId),
        content,
        purchase_order_id: poId
      }).subscribe({
        next: () => {
          this.newMessage = '';
          this.selectedFileName = '';
          this.selectedFileObj = null;
          this.loadConversations();
        },
        error: err => {
          console.error('Failed to send message', err);
          alert(err?.error?.detail || 'Message could not be sent.');
        }
      });
    };

    // Attachments are stored through the real file-sharing API before the
    // message is sent. The attachment then appears in the conversation.
    if (this.selectedFileObj) {
      this.communicationService.uploadSharedFile(this.selectedFileObj, {
        vendor_id: Number(this.selectedConversation.vendorId),
        purchase_order_id: poId
      }).subscribe({
        next: uploaded => {
          this.allFiles = [...this.allFiles, uploaded];
          this.attachments = this.getConversationFiles(this.selectedConversation);
          send();
        },
        error: err => {
          console.error('Failed to upload message attachment', err);
          alert(err?.error?.detail || 'Attachment could not be uploaded.');
        }
      });
      return;
    }

    send();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedFileObj = file;
    this.selectedFileName = file.name;
  }

  markConversationRead(): void {
    if (!this.selectedConversation) return;

    const unread = this.messages.filter(
      m => Number(m.receiverId) === this.currentUserId && m.readStatus !== 'Read'
    );

    unread.forEach(m => {
      this.communicationService.markMessageRead(Number(m.id)).subscribe({
        next: () => {
          m.readStatus = 'Read';
        },
        error: err => console.error('Failed to mark message read', err)
      });
    });

    this.selectedConversation.unreadCount = 0;
    this.unreadMessages = this.conversations.reduce(
      (sum, c) => sum + Number(c.unreadCount || 0),
      0
    );
    this.cdr.detectChanges();
  }

  previewFile(file: any): void {
    if (!file?.id) return;

    this.communicationService.downloadSharedFile(Number(file.id)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: err => alert(err?.error?.detail || 'Unable to preview file.')
    });
  }

  downloadFile(file: any): void {
    if (!file?.id) return;

    this.communicationService.downloadSharedFile(Number(file.id)).subscribe({
      next: blob => this.downloadBlob(blob, file.fileName || 'download'),
      error: err => alert(err?.error?.detail || 'File download failed.')
    });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    a.click();
    URL.revokeObjectURL(url);
  }

  openHistory(): void {
    this.router.navigate(['/communication-history']);
  }

  viewRecord(): void {
    const po = this.selectedConversation?.relatedPurchaseOrderId;

    if (po) {
      this.router.navigate(['/purchase-orders']);
      return;
    }

    alert('No purchase order is linked to this conversation yet.');
  }

  flagIssue(): void {
    if (!this.selectedConversation) return;

    const reason = prompt('Reason for flagging the vendor issue:');
    if (!reason?.trim()) return;

    this.communicationService.logActivity({
      activity_type: 'Vendor Issue Flagged',
      description: `${reason.trim()} | Conversation with ${this.selectedConversation.vendorName}`
    }).subscribe({
      next: () => alert('Issue activity logged successfully.'),
      error: err => alert(err?.error?.detail || 'Could not log the issue.')
    });
  }

  refreshConversations(): void {
    this.loadData();
  }
}
