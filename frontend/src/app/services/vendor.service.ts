import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllVendors(
    search: string = '',
    category: string = '',
    status: string = '',
    approval: string = '',
    page: number = 1,
    size: number = 10
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (search) {
      params = params.set('search', search);
    }

    if (category) {
      params = params.set('category', category);
    }

    if (status) {
      params = params.set('status', status);
    }

    if (approval) {
      params = params.set('approval', approval);
    }

    return this.http.get(
      `${this.apiUrl}/vendors`,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
  }

  getVendorById(id: number) {
  return this.http.get<any>(
    `${this.apiUrl}/vendors/${id}`,
    {
      headers: this.getAuthHeaders()
    }
  );
}

  createVendor(vendor: any): Observable<any> {

    const payload = {

      company_name: vendor.companyName,
      vendor_category: vendor.vendorCategory,
      contact_person: vendor.contactPerson,
      designation: vendor.designation,

      email: vendor.email,
      phone: vendor.phone,
      alternate_phone: vendor.alternatePhone,

      gst_number: vendor.gstNumber,
      pan_number: vendor.panNumber,
      company_registration_number: vendor.registrationNumber,

      address_line1: vendor.addressLine1,
      address_line2: vendor.addressLine2,
      city: vendor.city,
      state: vendor.state,
      country: vendor.country,
      pincode: vendor.pincode,

      website: vendor.website,
      description: vendor.description,

      bank_account_number: vendor.accountNumber,
      ifsc_code: vendor.ifscCode,
      payment_terms: vendor.paymentTerms

    };

    return this.http.post(
      `${this.apiUrl}/vendors`,
      payload,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  updateVendor(
    id: number,
    vendor: any
  ): Observable<any> {

    const payload = {

      company_name: vendor.companyName,
      vendor_category: vendor.vendorCategory,
      contact_person: vendor.contactPerson,
      designation: vendor.designation,

      email: vendor.email,
      phone: vendor.phone,
      alternate_phone: vendor.alternatePhone,

      gst_number: vendor.gstNumber,
      pan_number: vendor.panNumber,
      company_registration_number: vendor.registrationNumber,

      address_line1: vendor.addressLine1,
      address_line2: vendor.addressLine2,
      city: vendor.city,
      state: vendor.state,
      country: vendor.country,
      pincode: vendor.pincode,

      website: vendor.website,
      description: vendor.description,

      bank_account_number: vendor.accountNumber,
      ifsc_code: vendor.ifscCode,
      payment_terms: vendor.paymentTerms

    };

    return this.http.put(
      `${this.apiUrl}/vendors/${id}`,
      payload,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  deleteVendor(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/vendors/${id}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

    }