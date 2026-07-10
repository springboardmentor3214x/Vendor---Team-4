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

    // Stop if form validation fails
    if (this.loginForm.invalid) {
      return;
    }

    this.loginError = '';

    // Form values
    const loginData = this.loginForm.value;

    console.log('Login Data:', loginData);

    /*
   

    Replace the temporary console.log() above with
    the FastAPI Login API call.

    API Endpoint
    POST /login

    Request Body
  

    {
      "email": "...",
      "password": "..."
    }

    Expected Response
  

    {
      "token": "JWT_TOKEN",
      "role": "Administrator",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "admin@test.com"
      }
    }


    Replace:

        console.log('Login Data:', loginData);

    With something similar to:

        this.authService.login(loginData).subscribe({

          next: (response) => {

            // Save JWT
            localStorage.setItem('token', response.token);

            // Save User Role
            localStorage.setItem('role', response.role);

            // Redirect according to role

            Administrator
              -> /admin-dashboard

            Procurement Manager
              -> /procurement-dashboard

            Supply Chain Manager
              -> /supply-chain-dashboard

            Vendor
              -> /vendor-dashboard

            Finance Officer
              -> /finance-dashboard

            Auditor
              -> /auditor-dashboard

          },

          error: () => {

            this.loginError = 'Invalid email or password';

          }

        });


    1. Auth Guard checks whether a JWT token exists.

    2. Role Guard checks the user's role.

    3. Backend should return:

       - JWT Token
       - User Role
       - User Information

    4. No changes are required in the UI.
       Only replace this section with the API call.


    */

  }

}