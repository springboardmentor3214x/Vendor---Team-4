import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (password.value !== confirmPassword.value) {

    confirmPassword.setErrors({
      ...confirmPassword.errors,
      passwordMismatch: true
    });

  } else {

    if (confirmPassword.hasError('passwordMismatch')) {

      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];

      confirmPassword.setErrors(
        Object.keys(errors).length ? errors : null
      );

    }

  }

  return null;

}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})

export class Register {

  hidePassword = true;
  hideConfirmPassword = true;

  registerForm;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.registerForm = this.fb.group(
      {

        fullName: ['', Validators.required],

        employeeId: [''],

        companyName: [''],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9]{10}$')
          ]
        ],

        role: ['', Validators.required],

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
        ],

        terms: [
          false,
          Validators.requiredTrue
        ]

      },
      {
        validators: passwordMatchValidator
      }
    );

  }

  onSubmit() {

    // Stop if form validation fails
    if (this.registerForm.invalid) {
      return;
    }

    this.registerForm.markAllAsTouched();

    // Registration form data
    const registerData = this.registerForm.value;

    console.log('Register Data:', registerData);

    /*
 
    Replace the temporary console.log() above with
    the Register API call.

    
    API Endpoint
    

    POST /register

    
    Request Body
    

    {
      "fullName": "...",
      "employeeId": "...",
      "companyName": "...",
      "email": "...",
      "mobile": "...",
      "role": "...",
      "password": "..."
    }

    
    Expected Response
    

    {
      "success": true,
      "message": "User registered successfully"
    }

    
    Angular
    

    Replace:

        console.log('Register Data:', registerData);

    With something similar to:

        this.authService.register(registerData).subscribe({

          next: (response) => {

            // Registration successful

            this.router.navigate(['/login']);

          },

          error: (error) => {

            // Display backend validation message

            this.registerError = error.error.message;

          }

        });

    */

  }

}