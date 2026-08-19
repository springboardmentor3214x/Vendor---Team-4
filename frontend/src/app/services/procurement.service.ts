import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {

  private procurementUrl = `${environment.apiUrl}/procurement`;
  private purchaseOrderUrl = `${environment.apiUrl}/purchase-orders`;
  private trackingUrl = `${environment.apiUrl}/order-tracking`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  // ---------------- Procurement Requests ----------------

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.procurementUrl}/dashboard`, {
      headers: this.headers()
    });
  }

  getStatusDashboard(): Observable<any> {
    return this.http.get<any>(`${this.procurementUrl}/status-dashboard`, {
      headers: this.headers()
    });
  }

  getRequests(options: {
    search?: string;
    department?: string;
    status?: string;
    priority?: string;
    page?: number;
    size?: number;
  } = {}): Observable<any> {
    let params = new HttpParams()
      .set('page', String(options.page ?? 1))
      .set('size', String(options.size ?? 100));

    if (options.search) params = params.set('search', options.search);
    if (options.department && options.department !== 'All') {
      params = params.set('department', options.department);
    }
    if (options.status && options.status !== 'All') {
      params = params.set('status_filter', options.status);
    }
    if (options.priority && options.priority !== 'All') {
      params = params.set('priority', options.priority);
    }

    return this.http.get<any>(this.procurementUrl, {
      headers: this.headers(),
      params
    });
  }

  getRequest(id: number): Observable<any> {
    return this.http.get<any>(`${this.procurementUrl}/${id}`, {
      headers: this.headers()
    });
  }

  createRequest(data: any): Observable<any> {
    return this.http.post<any>(this.procurementUrl, data, {
      headers: this.headers()
    });
  }

  updateRequest(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.procurementUrl}/${id}`, data, {
      headers: this.headers()
    });
  }

  deleteRequest(id: number): Observable<any> {
    return this.http.delete<any>(`${this.procurementUrl}/${id}`, {
      headers: this.headers()
    });
  }

  approveRequest(id: number, remarks: string): Observable<any> {
    return this.http.put<any>(`${this.procurementUrl}/${id}/approve`, {
      remarks: remarks || null
    }, {
      headers: this.headers()
    });
  }

  rejectRequest(id: number, remarks: string): Observable<any> {
    return this.http.put<any>(`${this.procurementUrl}/${id}/reject`, {
      remarks: remarks || 'Request rejected.'
    }, {
      headers: this.headers()
    });
  }

  sendBackRequest(id: number, remarks: string): Observable<any> {
    return this.http.put<any>(`${this.procurementUrl}/${id}/send-back`, {
      remarks: remarks || 'Request sent back for modification.'
    }, {
      headers: this.headers()
    });
  }

  assignVendor(requestId: number, vendorId: number): Observable<any> {
    return this.http.put<any>(`${this.procurementUrl}/${requestId}/assign-vendor`, {
      vendor_id: vendorId
    }, {
      headers: this.headers()
    });
  }

  getAssignedVendor(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.procurementUrl}/${requestId}/assigned-vendor`, {
      headers: this.headers()
    });
  }

  getApprovedVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.procurementUrl}/approved-vendors`, {
      headers: this.headers()
    });
  }

  getProcurementStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.procurementUrl}/status`, {
      headers: this.headers()
    });
  }

  // ---------------- Purchase Orders ----------------

  getPurchaseOrderDashboard(): Observable<any> {
    return this.http.get<any>(`${this.purchaseOrderUrl}/dashboard`, { headers: this.headers() });
  }

  getPurchaseOrders(options: {
    status?: string;
    vendorId?: number;
    poNumber?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Observable<any[]> {
    let params = new HttpParams()
      .set('page', String(options.page ?? 1))
      .set('page_size', String(Math.min(Math.max(options.pageSize ?? 100, 1), 100)));

    if (options.status) params = params.set('status', options.status);
    if (options.vendorId) params = params.set('vendor_id', String(options.vendorId));
    if (options.poNumber) params = params.set('po_number', options.poNumber);
    if (options.startDate) params = params.set('start_date', options.startDate);
    if (options.endDate) params = params.set('end_date', options.endDate);
    if (options.sortBy) params = params.set('sort_by', options.sortBy);
    if (options.sortOrder) params = params.set('sort_order', options.sortOrder);

    return this.http.get<any[]>(this.purchaseOrderUrl, {
      headers: this.headers(),
      params
    });
  }

  getPurchaseOrder(id: number): Observable<any> {
    return this.http.get<any>(`${this.purchaseOrderUrl}/${id}`, {
      headers: this.headers()
    });
  }

  createPurchaseOrder(data: any): Observable<any> {
    return this.http.post<any>(this.purchaseOrderUrl, data, {
      headers: this.headers()
    });
  }

  updatePurchaseOrder(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.purchaseOrderUrl}/${id}`, data, {
      headers: this.headers()
    });
  }

  cancelPurchaseOrder(id: number): Observable<any> {
    return this.http.patch<any>(`${this.purchaseOrderUrl}/${id}/cancel`, {}, {
      headers: this.headers()
    });
  }

  // ---------------- Vendor Performance Records ----------------

  getDeliveryRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/delivery-performance`, { headers: this.headers() });
  }

  recordDelivery(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/delivery-performance`, data, { headers: this.headers() });
  }

  getQualityRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/product-quality`, { headers: this.headers() });
  }

  recordQuality(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/product-quality`, data, { headers: this.headers() });
  }

  getCommunicationRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/communication-log`, { headers: this.headers() });
  }

  recordCommunication(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/communication-log`, data, { headers: this.headers() });
  }

  getServiceRatings(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/service-rating`, { headers: this.headers() });
  }

  recordServiceRating(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/service-rating`, data, { headers: this.headers() });
  }

  // ---------------- Order Tracking ----------------

  getTrackingOrders(status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status && status !== 'All') params = params.set('status', status);
    return this.http.get<any[]>(this.trackingUrl, { headers: this.headers(), params });
  }

  getTrackingDashboard(): Observable<any> {
    return this.http.get<any>(`${this.trackingUrl}/dashboard`, {
      headers: this.headers()
    });
  }

  getOrderTracking(purchaseOrderId: number): Observable<any> {
    return this.http.get<any>(`${this.trackingUrl}/${purchaseOrderId}`, {
      headers: this.headers()
    });
  }

  updateOrderTracking(purchaseOrderId: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.trackingUrl}/${purchaseOrderId}`, {
      status
    }, {
      headers: this.headers()
    });
  }
}
