import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  hidePassword = true;

  loginError = '';

  loginForm;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.loginForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        Validators.required
      ],

      rememberMe: [false]

    });

  }

  onSubmit() {

    if (this.loginForm.invalid) {
      return;
    }

    this.loginError = '';

    const loginData = this.loginForm.value;

    console.log('Login Data:', loginData);

    /*
      ==========================================
      FastAPI Integration (Milestone 2)
      ==========================================

      POST /login

      Request:
      {
        email,
        password
      }

      Response:
      {
        token: "...",
        role: "Administrator",
        user: {
          id,
          name,
          email
        }
      }

      Angular will then:

      1. Store JWT Token

         localStorage.setItem('token', response.token);

      2. Store User Role

         localStorage.setItem('role', response.role);

      3. Redirect according to role

         Administrator        -> /admin
         Procurement Manager  -> /procurement
         Supply Chain Manager -> /supply-chain
         Vendor               -> /vendor
         Finance Officer      -> /finance
         Auditor              -> /auditor

      4. Route Guards will protect
         unauthorized pages.
    */

  }

}