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

import { AuthService } from '../../../services/auth.service';


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

      const errors = {
        ...confirmPassword.errors
      };

      delete errors['passwordMismatch'];

      confirmPassword.setErrors(
        Object.keys(errors).length
          ? errors
          : null
      );
    }
  }

  return null;
}


function roleBasedValidator(
  control: AbstractControl
): ValidationErrors | null {

  const role = control.get('role')?.value;

  const employeeId =
    control.get('employeeId')?.value;

  const companyName =
    control.get('companyName')?.value;

  if (
    role === 'Vendor' &&
    !companyName?.trim()
  ) {

    return {
      companyNameRequired: true
    };

  }

  if (
    role &&
    role !== 'Vendor' &&
    !employeeId?.trim()
  ) {

    return {
      employeeIdRequired: true
    };

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
    private router: Router,
    private authService: AuthService
  ) {

    this.registerForm = this.fb.group(
      {

        fullName: [
          '',
          Validators.required
        ],

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
            Validators.pattern(
              '^[0-9]{10}$'
            )
          ]
        ],

        role: [
          '',
          Validators.required
        ],

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
        validators: [
          passwordMatchValidator,
          roleBasedValidator
        ]
      }
    );

  }


  onSubmit() {

    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {

      if (
        this.registerForm.hasError(
          'companyNameRequired'
        )
      ) {

        alert(
          'Company Name is required for Vendor'
        );

      } else if (
        this.registerForm.hasError(
          'employeeIdRequired'
        )
      ) {

        alert(
          'Employee ID is required for internal users'
        );

      }

      return;
    }


    const registerData =
      this.registerForm.value;


    this.authService
      .register(registerData)
      .subscribe({

        next: (response) => {

          console.log(
            'Registration response:',
            response
          );

          alert(
            'Registration successful'
          );

          this.router.navigate([
            '/login'
          ]);

        },


        error: (error) => {

          console.error(
            'Registration error:',
            error
          );

          if (error.status === 400) {

            alert(
              error.error?.detail
            );

          } else if (
            error.status === 422
          ) {

            alert(
              error.error?.detail?.[0]?.msg ||
              'Please check the registration details'
            );

          } else {

            alert(
              'Registration failed'
            );

          }

        }

      });

  }

}