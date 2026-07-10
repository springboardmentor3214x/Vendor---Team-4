import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  forgotPasswordForm;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.forgotPasswordForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]

    });

  }

  onSubmit() {

    // Stop if validation fails
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    // Form data
    const forgotPasswordData = this.forgotPasswordForm.value;

    console.log('Forgot Password Data:', forgotPasswordData);

    /*
    
    Replace the temporary console.log() above with
    the Forgot Password API call.

    
    API Endpoint
    

    POST /forgot-password

    
    Request Body
    

    {
      "email": "user@example.com"
    }

    
    Expected Response
    

    {
      "success": true,
      "message": "Password reset link sent successfully."
    }

    OR

    {
      "success": false,
      "message": "Email not found."
    }

    
    Angular 
    

    Replace:

        console.log('Forgot Password Data:', forgotPasswordData);

    With something similar to:

        this.authService.forgotPassword(forgotPasswordData).subscribe({

          next: (response) => {

            // Show success message

            // Redirect to Login page
            // OR
            // Redirect to Reset Password page

          },

          error: (error) => {

            // Display backend error message

          }

        });

    */

  }

}