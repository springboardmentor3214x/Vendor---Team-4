import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface NotificationResponse {
  id: number;
  user_id: number;
  notification_type: string;
  title: string;
  description: string;
  related_module?: string;
  related_record_id?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  delivery_method: 'IN_APP' | 'EMAIL' | 'SMS';
  is_read: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(days: number = 30): Observable<NotificationResponse[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/`, { params });
  }

  getStoredNotifications(options: { module?: string; priority?: string; is_read?: boolean; notification_date?: string; notification_type?: string } = {}): Observable<NotificationResponse[]> {
    let params = new HttpParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    });
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/stored`, { params });
  }

  getUnreadNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/unread`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.apiUrl}/${id}/read`, {});
  }

  markAsUnread(id: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.apiUrl}/${id}/unread`, {});
  }

  markAllAsRead(): Observable<{ message: string; count: number }> {
    return this.http.put<{ message: string; count: number }>(`${this.apiUrl}/read-all`, {});
  }

  createNotification(payload: {
    user_id: number;
    notification_type: string;
    title: string;
    description: string;
    related_module?: string;
    related_record_id?: number;
    priority?: string;
    delivery_method?: string;
  }): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(`${this.apiUrl}/`, payload);
  }
}
