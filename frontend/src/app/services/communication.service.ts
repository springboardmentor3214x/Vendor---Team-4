import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserContact {
  id: number;
  name: string;
  email: string;
  role: string;
  company_name?: string | null;
}

export interface MessageRecord {
  id: number;
  sender_id: number;
  receiver_id: number;
  purchase_order_id?: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DiscussionRecord {
  id: number;
  title: string;
  description: string;
  purchase_order_id: number;
  created_by: number;
  status: string;
  created_at: string;
  replies_count?: number;
}

export interface DiscussionReply {
  id: number;
  discussion_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  user_name?: string;
  user_role?: string;
}

export interface FileShareRecord {
  id: number;
  file_name: string;
  file_size?: number | null;
  file_path: string;
  file_type: string;
  uploaded_by: number;
  vendor_id?: number | null;
  purchase_order_id?: number | null;
  discussion_id?: number | null;
  uploaded_at: string;
}

export interface ActivityLogRecord {
  id: number;
  user_id: number;
  activity_type: string;
  description: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Communication endpoints that read/write user data require the same
   * bearer token used by the rest of the application.
   */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  private authOptions() {
    return { headers: this.authHeaders() };
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/me`, this.authOptions());
  }

  getContacts(): Observable<UserContact[]> {
    return this.http.get<UserContact[]>(`${this.baseUrl}/users/contacts`, this.authOptions());
  }

  getMessages(): Observable<MessageRecord[]> {
    return this.http.get<MessageRecord[]>(`${this.baseUrl}/messages/mine`, this.authOptions());
  }

  getConversation(otherUserId: number): Observable<MessageRecord[]> {
    return this.http.get<MessageRecord[]>(
      `${this.baseUrl}/messages/conversation/${otherUserId}`,
      this.authOptions()
    );
  }

  sendMessage(payload: {
    receiver_id: number;
    content: string;
    purchase_order_id?: number | null;
  }): Observable<MessageRecord> {
    return this.http.post<MessageRecord>(`${this.baseUrl}/messages/`, {
      receiver_id: payload.receiver_id,
      purchase_order_id: payload.purchase_order_id ?? null,
      message: payload.content
    }, this.authOptions());
  }

  markMessageRead(messageId: number): Observable<MessageRecord> {
    return this.http.patch<MessageRecord>(
      `${this.baseUrl}/messages/${messageId}/read`, {}, this.authOptions()
    );
  }

  getDiscussions(): Observable<DiscussionRecord[]> {
    return this.http.get<DiscussionRecord[]>(`${this.baseUrl}/discussions/`, this.authOptions());
  }

  createDiscussion(payload: {
    title: string;
    description: string;
    purchase_order_id: number;
  }): Observable<DiscussionRecord> {
    return this.http.post<DiscussionRecord>(`${this.baseUrl}/discussions/`, payload, this.authOptions());
  }

  updateDiscussion(id: number, payload: {
    title: string;
    description: string;
    status: string;
  }): Observable<DiscussionRecord> {
    return this.http.put<DiscussionRecord>(
      `${this.baseUrl}/discussions/${id}`,
      payload,
      this.authOptions()
    );
  }

  getDiscussionReplies(discussionId: number): Observable<DiscussionReply[]> {
    return this.http.get<DiscussionReply[]>(
      `${this.baseUrl}/discussions/${discussionId}/replies`,
      this.authOptions()
    );
  }

  addDiscussionReply(discussionId: number, comment: string): Observable<DiscussionReply> {
    return this.http.post<DiscussionReply>(
      `${this.baseUrl}/discussions/${discussionId}/replies`,
      { comment },
      this.authOptions()
    );
  }

  getCommunicationHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/communication-history/`, this.authOptions());
  }

  getFileShares(): Observable<FileShareRecord[]> {
    return this.http.get<FileShareRecord[]>(`${this.baseUrl}/files/`, this.authOptions());
  }

  uploadSharedFile(
    file: File,
    links: {
      vendor_id?: number | null;
      purchase_order_id?: number | null;
      discussion_id?: number | null;
      contract_id?: number | null;
    }
  ): Observable<FileShareRecord> {
    const formData = new FormData();
    formData.append('file', file);
    if (links.vendor_id) formData.append('vendor_id', String(links.vendor_id));
    if (links.purchase_order_id) formData.append('purchase_order_id', String(links.purchase_order_id));
    if (links.discussion_id) formData.append('discussion_id', String(links.discussion_id));
    if (links.contract_id) formData.append('contract_id', String(links.contract_id));
    return this.http.post<FileShareRecord>(
      `${this.baseUrl}/files/upload`,
      formData,
      this.authOptions()
    );
  }

  deleteSharedFile(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/files/${id}`, this.authOptions());
  }

  downloadSharedFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/files/${id}/download`, {
      responseType: 'blob',
      headers: this.authHeaders()
    });
  }

  getActivityLogs(): Observable<ActivityLogRecord[]> {
    return this.http.get<ActivityLogRecord[]>(`${this.baseUrl}/activity-logs/`, this.authOptions());
  }

  logActivity(payload: {
    activity_type: string;
    description: string;
  }): Observable<ActivityLogRecord> {
    return this.http.post<ActivityLogRecord>(
      `${this.baseUrl}/activity-logs/`,
      payload,
      this.authOptions()
    );
  }

  getStoredNotifications(filters?: {
    is_read?: boolean;
    notification_type?: string;
    related_module?: string;
  }): Observable<any[]> {
    const params: Record<string, string> = {};
    if (filters?.is_read !== undefined) params['is_read'] = String(filters.is_read);
    if (filters?.notification_type) params['notification_type'] = filters.notification_type;
    if (filters?.related_module) params['module'] = filters.related_module;
    return this.http.get<any[]>(`${this.baseUrl}/notifications/stored`, {
      params,
      headers: this.authHeaders()
    });
  }

  getUnreadNotificationCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/notifications/unread-count`, this.authOptions());
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/${id}/read`, {}, this.authOptions());
  }

  markNotificationUnread(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/${id}/unread`, {}, this.authOptions());
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/read-all`, {}, this.authOptions());
  }

  createNotification(payload: {
    user_id: number;
    notification_type: string;
    title: string;
    description: string;
    related_module?: string;
    related_record_id?: number | null;
    priority?: string;
    delivery_method?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/`, payload, this.authOptions());
  }

  getCommunicationDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/communication`, this.authOptions());
  }

  getPurchaseOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/purchase-orders`, this.authOptions());
  }

  getVendors(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/vendors/`, this.authOptions()).pipe(
      map(response => Array.isArray(response) ? response : (response?.items || []))
    );
  }

  getContracts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/contracts/`, this.authOptions());
  }

  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/invoices`, this.authOptions());
  }

  getComplianceRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compliance/`, this.authOptions());
  }
}
