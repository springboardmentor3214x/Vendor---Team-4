import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../services/auth.service';


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
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }


    this.loginError = '';


    const email =
      this.loginForm.value.email!;

    const password =
      this.loginForm.value.password!;


    this.authService
      .login(email, password)
      .subscribe({

        next: (response) => {

          console.log(
            'Login response:',
            response
          );


          localStorage.setItem(
            'token',
            response.access_token
          );


          this.authService
            .getCurrentUser()
            .subscribe({

              next: (user) => {

                console.log(
                  'Current user:',
                  user
                );


                const role =
                  user.role
                    .trim()
                    .toLowerCase();


                localStorage.setItem(
                  'role',
                  role
                );


                console.log(
                  'Normalized role:',
                  role
                );


                switch (role) {

                  case 'administrator':

                    this.router.navigate([
                      '/admin-dashboard'
                    ]);

                    break;


                  case 'procurement manager':

                    this.router.navigate([
                      '/procurement-dashboard'
                    ]);

                    break;


                  case 'supply chain manager':

                    this.router.navigate([
                      '/supply-chain-dashboard'
                    ]);

                    break;


                  case 'vendor':

                    this.router.navigate([
                      '/vendor-dashboard'
                    ]);

                    break;


                  case 'finance officer':

                    this.router.navigate([
                      '/finance-dashboard'
                    ]);

                    break;


                  case 'auditor':

                    this.router.navigate([
                      '/auditor-dashboard'
                    ]);

                    break;


                  default:

                    console.log(
                      'Unknown role:',
                      role
                    );

                    this.loginError =
                      'Invalid user role';

                    this.cdr.detectChanges();

                }

              },


              error: (error) => {

                console.error(
                  'User error:',
                  error
                );

                this.loginError =
                  'Unable to get user details';

                this.cdr.detectChanges();

              }

            });

        },


        error: (error) => {

          console.error(
            'Login error:',
            error
          );

          this.loginError =
            'Invalid user credentials';

          this.cdr.detectChanges();

        }

      });

  }

}