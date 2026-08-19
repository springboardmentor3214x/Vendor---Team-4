import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorReliabilityService {
  private readonly baseUrl = `${environment.apiUrl}/vendor-reliability`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`, { headers: this.headers() });
  }

  getRankings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rankings`, { headers: this.headers() });
  }

  getVendor(vendorId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${vendorId}`, { headers: this.headers() });
  }

  getHistory(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${vendorId}`, { headers: this.headers() });
  }

  getTrend(vendorId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/trend/${vendorId}`, { headers: this.headers() });
  }

  getRecommendation(vendorId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/recommendation/${vendorId}`, { headers: this.headers() });
  }
}
