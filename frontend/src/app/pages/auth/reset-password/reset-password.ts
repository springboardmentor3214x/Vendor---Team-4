import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordMismatch: true };
  }

  return null;

}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})

export class ResetPassword {

  hidePassword = true;
  hideConfirmPassword = true;

  resetPasswordForm;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.resetPasswordForm = this.fb.group({

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ]

    },
    {
      validators: passwordMatchValidator
    });

  }

  onSubmit() {

    // Stop if form validation fails
    if (this.resetPasswordForm.invalid) {
      return;
    }

    // Form data
    const resetPasswordData = this.resetPasswordForm.value;

    console.log('Reset Password Data:', resetPasswordData);

    /*


    Replace the temporary console.log() above with
    the Reset Password API call.

    
    API Endpoint
    

    POST /reset-password

    
    Request Body
    

    {
      "token": "<RESET_TOKEN>",
      "password": "...",
      "confirmPassword": "..."
    }

    Note:
    The reset token will usually come from the
    password reset email or URL.

    Example:

    /reset-password?token=...

    
    Expected Response
    

    {
      "success": true,
      "message": "Password updated successfully."
    }

    OR

    {
      "success": false,
      "message": "Reset token is invalid or expired."
    }

    
    Angular 
    

    Replace:

        console.log('Reset Password Data:', resetPasswordData);

    With something similar to:

        this.authService.resetPassword(
          resetPasswordData
        ).subscribe({

          next: (response) => {

            // Show success message

            // Redirect user to Login page

            this.router.navigate(['/login']);

          },

          error: (error) => {

            // Display backend validation message

          }

        });

    */

  }

}