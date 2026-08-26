import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

/*
==============================================================
Backend Vendor Record Shape

Matches VendorResponse in app/schemas/vendor.py
==============================================================
*/
export interface VendorRecord {
  id: number;
  vendor_id: string;
  company_name: string;
  vendor_category: string;
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
  alternate_phone: string | null;
  gst_number: string;
  pan_number: string;
  company_registration_number: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  website: string | null;
  description: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
  payment_terms: string | null;
  vendor_status: string;
  approval_status: string;
  created_at: string;
}

export interface VendorListResponse {
  total: number;
  page: number;
  size: number;
  total_pages: number;
  items: VendorRecord[];
}

export interface VendorDashboardResponse {
  total_vendors: number;
  pending_vendors: number;
  approved_vendors: number;
  rejected_vendors: number;
  active_vendors: number;
  inactive_vendors: number;
  suspended_vendors: number;
}

export interface VendorApprovalResponse {
  message: string;
  vendor_id: string;
  approval_status: string;
  vendor_status: string;
}

export interface VendorQueryParams {
  search?: string;
  category?: string;
  status?: string;
  approval?: string;
  sort_by?: string;
  order?: string;
  page?: number;
  size?: number;
}

export interface VendorDocumentRecord {
  id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private apiUrl = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient) {}

  // ================= List / Search / Filter =================

  getVendors(params: VendorQueryParams = {}): Observable<VendorListResponse> {

    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value as string | number);
      }
    });

    return this.http.get<VendorListResponse>(`${this.apiUrl}/`, {
      params: httpParams
    });
  }

  // ================= Dashboard Statistics =================

  getVendorMeDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/dashboard`);
  }

  getDashboard(): Observable<VendorDashboardResponse> {
    return this.http.get<VendorDashboardResponse>(`${this.apiUrl}/dashboard`);
  }

  // ================= Single Vendor =================

  getVendorById(id: number): Observable<VendorRecord> {
    return this.http.get<VendorRecord>(`${this.apiUrl}/${id}`);
  }

  // Returns the logged-in vendor's own record, auto-creating a
  // blank one on the backend the first time it's requested.
  getMyVendorProfile(): Observable<VendorRecord> {
    return this.http.get<VendorRecord>(`${this.apiUrl}/me`);
  }

  // ================= Create =================

  createVendor(payload: Record<string, unknown>): Observable<VendorRecord> {
    return this.http.post<VendorRecord>(`${this.apiUrl}/`, payload);
  }

  // ================= Update =================

  updateVendor(id: number, payload: Record<string, unknown>): Observable<VendorRecord> {
    return this.http.put<VendorRecord>(`${this.apiUrl}/${id}`, payload);
  }

  // ================= Delete =================

  deleteVendor(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ================= Approve / Reject =================

  approveVendor(id: number): Observable<VendorApprovalResponse> {
    return this.http.patch<VendorApprovalResponse>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectVendor(id: number): Observable<VendorApprovalResponse> {
    return this.http.patch<VendorApprovalResponse>(`${this.apiUrl}/${id}/reject`, {});
  }

  // ================= Documents =================

  uploadDocument(
    vendorId: number,
    documentType: string,
    file: File
  ): Observable<{ message: string; file_name: string; document_type: string }> {

    const formData = new FormData();

    formData.append('document_type', documentType);
    formData.append('file', file);

    return this.http.post<{ message: string; file_name: string; document_type: string }>(
      `${this.apiUrl}/${vendorId}/documents`,
      formData
    );
  }

  getDocuments(vendorId: number): Observable<VendorDocumentRecord[]> {
    return this.http.get<VendorDocumentRecord[]>(`${this.apiUrl}/${vendorId}/documents`);
  }

  // Document downloads require the Authorization header, so a plain
  // <a href> / window.open won't work -- fetch it as a blob (the auth
  // interceptor attaches the token) and let the caller save it.
  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  deleteDocument(documentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/documents/${documentId}`);
  }
}
