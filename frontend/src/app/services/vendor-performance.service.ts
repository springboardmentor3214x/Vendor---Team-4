import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VendorPerformanceSummary {
  total_vendors: number;
  total_completed_orders: number;
  delayed_deliveries: number;
  average_delivery_performance: number;
  average_quality_rating: number;
  average_response_time: number;
  average_vendor_score: number;
  best_vendor: string | null;
  worst_vendor: string | null;
}

@Injectable({ providedIn: 'root' })
export class VendorPerformanceService {
  private readonly baseUrl = `${environment.apiUrl}/vendor-performance`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token || ''}` });
  }

  getDashboardSummary(): Observable<VendorPerformanceSummary> {
    return this.http.get<VendorPerformanceSummary>(`${this.baseUrl}/dashboard/summary`, { headers: this.headers() });
  }

  getRankings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rankings`, { headers: this.headers() });
  }

  getVendorPerformance(vendorId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${vendorId}`, { headers: this.headers() });
  }

  getHistory(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${vendorId}`, { headers: this.headers() });
  }
}
