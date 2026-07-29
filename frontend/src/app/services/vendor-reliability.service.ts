import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorReliabilityService {

  private apiUrl = 'http://127.0.0.1:8000/vendor-reliability';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/dashboard`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getRankings(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/rankings`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getVendorReliability(vendorId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${vendorId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getVendorHistory(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/history/${vendorId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getVendorTrend(vendorId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/trend/${vendorId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getRecommendation(vendorId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/recommendation/${vendorId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}