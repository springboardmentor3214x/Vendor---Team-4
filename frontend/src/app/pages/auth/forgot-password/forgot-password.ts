import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../services/auth.service';


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
    private router: Router,
    private authService: AuthService
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

    this.forgotPasswordForm.markAllAsTouched();

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    const email =
      this.forgotPasswordForm.value.email!;


    this.authService
      .forgotPassword(email)
      .subscribe({

        next: (response) => {

          console.log(
            'Forgot Password Response:',
            response
          );

          alert(
            'Reset token generated successfully'
          );

          this.router.navigate(
            ['/reset-password'],
            {
              queryParams: {
                token: response.reset_token
              }
            }
          );

        },


        error: (error) => {

          console.error(
            'Forgot Password Error:',
            error
          );

          alert(
            error.error?.detail ||
            'Unable to process request'
          );

        }

      });

  }

}