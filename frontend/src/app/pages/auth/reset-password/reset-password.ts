import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../services/auth.service';


function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password =
    control.get('password')?.value;

  const confirmPassword =
    control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {

    return {
      passwordMismatch: true
    };

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

  resetToken = '';

  resetPasswordForm;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {

    this.resetToken =
      this.route.snapshot.queryParamMap
        .get('token') || '';


    this.resetPasswordForm = this.fb.group(
      {

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
      }
    );

  }


  onSubmit() {

    this.resetPasswordForm.markAllAsTouched();

    if (this.resetPasswordForm.invalid) {
      return;
    }


    if (!this.resetToken) {

      alert(
        'Invalid password reset token'
      );

      return;

    }


    const password =
      this.resetPasswordForm.value.password!;

    const confirmPassword =
      this.resetPasswordForm.value
        .confirmPassword!;


    this.authService
      .resetPassword(
        this.resetToken,
        password,
        confirmPassword
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Reset Password Response:',
            response
          );

          alert(
            'Password reset successfully'
          );

          this.router.navigate([
            '/login'
          ]);

        },


        error: (error) => {

          console.error(
            'Reset Password Error:',
            error
          );

          alert(
            error.error?.detail ||
            'Password reset failed'
          );

        }

      });

  }

}