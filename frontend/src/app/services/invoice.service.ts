import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvoiceDashboardData {
  total_invoices: number;
  pending: number;
  paid: number;
  total_amount: number;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<InvoiceDashboardData> {
    return this.http.get<InvoiceDashboardData>(`${this.apiUrl}/dashboard`);
  }
}
