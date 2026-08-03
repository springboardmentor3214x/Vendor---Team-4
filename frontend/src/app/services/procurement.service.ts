import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {

  private apiUrl = 'http://127.0.0.1:8000/procurement';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`, {
      headers: this.headers()
    });
  }

  getStatusDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status-dashboard`, {
      headers: this.headers()
    });
  }

  getRequests(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.headers()
    });
  }

}