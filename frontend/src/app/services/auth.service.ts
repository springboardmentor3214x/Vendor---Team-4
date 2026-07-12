import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000';


  constructor(
    private http: HttpClient
  ) {}


  private getAuthHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }


  register(data: any): Observable<any> {

    const registerData = {

      full_name: data.fullName,

      employee_id:
        data.employeeId || null,

      company_name:
        data.companyName || null,

      email: data.email,

      mobile_number: data.mobile,

      password: data.password,

      role: data.role

    };


    return this.http.post(

      `${this.apiUrl}/auth/register`,

      registerData

    );

  }


  login(
    email: string,
    password: string
  ): Observable<any> {

    const body =
      new URLSearchParams();

    body.set('username', email);

    body.set('password', password);


    const headers = new HttpHeaders({

      'Content-Type':
        'application/x-www-form-urlencoded'

    });


    return this.http.post(

      `${this.apiUrl}/auth/login`,

      body.toString(),

      { headers }

    );

  }


  getCurrentUser(): Observable<any> {

    return this.http.get(

      `${this.apiUrl}/users/me`,

      {
        headers: this.getAuthHeaders()
      }

    );

  }


  updateProfile(
    fullName: string,
    mobileNumber: string
  ): Observable<any> {

    return this.http.put(

      `${this.apiUrl}/users/me`,

      {
        full_name: fullName,
        mobile_number: mobileNumber
      },

      {
        headers: this.getAuthHeaders()
      }

    );

  }


  updatePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {

    return this.http.put(

      `${this.apiUrl}/users/me/password`,

      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      },

      {
        headers: this.getAuthHeaders()
      }

    );

  }


  forgotPassword(
    email: string
  ): Observable<any> {

    return this.http.post(

      `${this.apiUrl}/auth/forgot-password`,

      { email }

    );

  }


  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {

    return this.http.post(

      `${this.apiUrl}/auth/reset-password`,

      {
        token: token,
        new_password: newPassword,
        confirm_password: confirmPassword
      }

    );

  }

}