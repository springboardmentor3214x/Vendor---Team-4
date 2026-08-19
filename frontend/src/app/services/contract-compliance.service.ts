import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContractRecord {
  id: number; contract_number: string; contract_title: string; vendor_id: number; contract_type: string;
  start_date: string; end_date: string; contract_value: number; status: string; description?: string | null;
  document_path?: string | null; created_at?: string; updated_at?: string; vendor_name?: string;
}
export interface CertificationRecord {
  id: number; vendor_id: number; certification_name: string; certification_number: string;
  issuing_authority: string; issue_date: string; expiry_date: string; status: string; document_path?: string | null; vendor_name?: string;
}
export interface VendorDocumentItem {
  id: number; vendor_id: number; document_type: string; file_name: string; file_path: string;
  file_size?: number; file_type?: string; status: string; uploaded_at: string; expiry_date?: string | null; vendor_name?: string;
}
export interface ComplianceRecord {
  vendor_id: number; vendor_name: string; contract_status: string; certification_status: string;
  document_status: string; compliance_percentage: number; overall_status: string;
}

@Injectable({ providedIn: 'root' })
export class ContractComplianceService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  private vendorMap(): Observable<Map<number,string>> {
    return this.http.get<any>(`${this.baseUrl}/vendors/`, { params: new HttpParams().set('page', 1).set('size', 1000) }).pipe(
      map(r => { const m = new Map<number,string>(); (r?.items || []).forEach((v:any) => m.set(Number(v.id), v.company_name)); return m; }),
      catchError(() => of(new Map<number,string>()))
    );
  }

  getContracts(): Observable<ContractRecord[]> {
    return forkJoin({ rows: this.http.get<ContractRecord[]>(`${this.baseUrl}/contracts/`), vendors: this.vendorMap() }).pipe(
      map(({rows,vendors}) => rows.map(r => ({...r, vendor_name: vendors.get(Number(r.vendor_id)) || `Vendor #${r.vendor_id}`})))
    );
  }
  getContract(id:number): Observable<ContractRecord> {
    return forkJoin({ row: this.http.get<ContractRecord>(`${this.baseUrl}/contracts/${id}`), vendors: this.vendorMap() }).pipe(map(({row,vendors}) => ({...row, vendor_name: vendors.get(Number(row.vendor_id)) || `Vendor #${row.vendor_id}`})));
  }
  createContract(contract: any): Observable<ContractRecord> { return this.http.post<ContractRecord>(`${this.baseUrl}/contracts/`, contract); }
  updateContract(id:number, contract:any): Observable<ContractRecord> { return this.http.put<ContractRecord>(`${this.baseUrl}/contracts/${id}`, contract); }
  deleteContract(id:number): Observable<any> { return this.http.delete(`${this.baseUrl}/contracts/${id}`); }
  getExpiringContracts(days=30): Observable<ContractRecord[]> { return this.http.get<ContractRecord[]>(`${this.baseUrl}/contracts/expiring/`, {params:{days}}); }
  getExpiredContracts(): Observable<ContractRecord[]> { return this.http.get<ContractRecord[]>(`${this.baseUrl}/contracts/expired/`); }
  getActiveContracts(): Observable<ContractRecord[]> { return this.http.get<ContractRecord[]>(`${this.baseUrl}/contracts/active/`); }
  renewContract(id:number,newEndDate:string): Observable<ContractRecord> { return this.http.put<ContractRecord>(`${this.baseUrl}/contracts/${id}/renew`, {}, {params:{new_end_date:newEndDate}}); }
  updateContractStatus(id:number,status:string): Observable<ContractRecord> { return this.http.patch<ContractRecord>(`${this.baseUrl}/contracts/${id}/status`, {}, {params:{status}}); }
  uploadContractDocument(id:number,file:File): Observable<ContractRecord> { const fd=new FormData(); fd.append('file',file); return this.http.post<ContractRecord>(`${this.baseUrl}/contracts/${id}/document`,fd); }
  downloadContractDocument(id:number):Observable<Blob>{return this.http.get(`${this.baseUrl}/contracts/${id}/document`,{responseType:'blob'});}
  getVendorContracts(vendorId:number): Observable<ContractRecord[]> { return this.http.get<ContractRecord[]>(`${this.baseUrl}/contracts/vendor/${vendorId}`); }

  getCertifications(): Observable<CertificationRecord[]> {
    return forkJoin({ rows:this.http.get<CertificationRecord[]>(`${this.baseUrl}/certifications/`), vendors:this.vendorMap() }).pipe(map(({rows,vendors}) => rows.map(r=>({...r,vendor_name:vendors.get(Number(r.vendor_id))||`Vendor #${r.vendor_id}`}))));
  }
  createCertification(cert:any):Observable<CertificationRecord>{return this.http.post<CertificationRecord>(`${this.baseUrl}/certifications/`,cert);}
  updateCertification(id:number,cert:any):Observable<CertificationRecord>{return this.http.put<CertificationRecord>(`${this.baseUrl}/certifications/${id}`,cert);}
  deleteCertification(id:number):Observable<any>{return this.http.delete(`${this.baseUrl}/certifications/${id}`);}
  getExpiringCertifications(days=30):Observable<CertificationRecord[]>{return this.http.get<CertificationRecord[]>(`${this.baseUrl}/certifications/expiring/`,{params:{days}});}
  updateCertificationStatus(id:number,status:string):Observable<CertificationRecord>{return this.http.patch<CertificationRecord>(`${this.baseUrl}/certifications/${id}/status`,{}, {params:{status}});}

  getVendorDocuments():Observable<VendorDocumentItem[]>{
    return forkJoin({rows:this.http.get<VendorDocumentItem[]>(`${this.baseUrl}/vendor-documents/`),vendors:this.vendorMap()}).pipe(map(({rows,vendors})=>rows.map(r=>({...r,vendor_name:vendors.get(Number(r.vendor_id))||`Vendor #${r.vendor_id}`}))));
  }
  uploadVendorDocument(vendorId:number,documentType:string,file:File,expiryDate?:string):Observable<VendorDocumentItem>{const fd=new FormData();fd.append('vendor_id',String(vendorId));fd.append('document_type',documentType);if(expiryDate)fd.append('expiry_date',expiryDate);fd.append('file',file);return this.http.post<VendorDocumentItem>(`${this.baseUrl}/vendor-documents/upload`,fd);}
  verifyVendorDocument(id:number,status:string):Observable<VendorDocumentItem>{return this.http.patch<VendorDocumentItem>(`${this.baseUrl}/vendor-documents/${id}/status`,{}, {params:{status}});}
  deleteVendorDocument(id:number):Observable<any>{return this.http.delete(`${this.baseUrl}/vendor-documents/${id}`);}
  downloadVendorDocument(id:number):Observable<Blob>{return this.http.get(`${this.baseUrl}/vendor-documents/${id}/download`,{responseType:'blob'});}

  getComplianceOverview():Observable<{records:ComplianceRecord[];summary:any}>{
    return forkJoin({records:this.http.get<ComplianceRecord[]>(`${this.baseUrl}/compliance/`),summary:this.http.get<any>(`${this.baseUrl}/compliance/summary`)});
  }
  getVendorCompliance(vendorId:number):Observable<ComplianceRecord>{return this.http.get<ComplianceRecord>(`${this.baseUrl}/compliance/vendor/${vendorId}`);}
  getExpiringCompliance(days=30):Observable<any>{return this.http.get<any>(`${this.baseUrl}/compliance/expiring`,{params:{days}});}

  getContractNotifications(days=90):Observable<any[]>{return this.http.get<any[]>(`${this.baseUrl}/notifications/contracts`,{params:{days}});}
  getNotifications():Observable<any[]>{return this.http.get<any[]>(`${this.baseUrl}/notifications/`);}
  markNotificationRead(id:number):Observable<any>{return this.http.put(`${this.baseUrl}/notifications/${id}/read`,{});}
}
