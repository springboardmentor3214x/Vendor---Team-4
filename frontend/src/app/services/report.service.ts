import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface ReportQueryParams {
  vendor_category?: string;
  vendor_name?: string;
  department_name?: string;
  category?: string;
  status?: string;
  compliance_status?: string;
  contract_type?: string;
  start_date?: string;
  end_date?: string;
  expiring_within_days?: number;
  sort_by?: string;
  sort_order?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  private buildParams(params: ReportQueryParams = {}): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        httpParams = httpParams.set(key, value as string | number);
      }
    });
    return httpParams;
  }

  // ================= JSON Report Data Endpoints =================

  getVendorPerformanceReport(params: ReportQueryParams = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor-performance`, {
      params: this.buildParams(params)
    });
  }

  getProcurementReport(params: ReportQueryParams = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/procurement`, {
      params: this.buildParams(params)
    });
  }

  getPurchaseOrderReport(params: ReportQueryParams = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/purchase-orders`, {
      params: this.buildParams(params)
    });
  }

  getComplianceReport(params: ReportQueryParams = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/compliance`, {
      params: this.buildParams(params)
    });
  }

  getContractReport(params: ReportQueryParams = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts`, {
      params: this.buildParams(params)
    });
  }

  getExecutiveSummaryReport(params: ReportQueryParams = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/executive-summary`, {
      params: this.buildParams(params)
    });
  }

  // ================= PDF Export Endpoints =================

  getReportPdf(reportType: string, params: ReportQueryParams = {}): Observable<Blob> {
    const endpoint = `${this.apiUrl}/${reportType}/pdf`;
    return this.http.get(endpoint, {
      params: this.buildParams(params),
      responseType: 'blob'
    });
  }

  // ================= Excel Export Endpoints =================

  getReportExcel(reportType: string, params: ReportQueryParams = {}): Observable<Blob> {
    const endpoint = `${this.apiUrl}/${reportType}/excel`;
    return this.http.get(endpoint, {
      params: this.buildParams(params),
      responseType: 'blob'
    });
  }
}
