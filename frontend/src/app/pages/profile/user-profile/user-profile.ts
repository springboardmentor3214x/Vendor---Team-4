import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../services/auth.service';


function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!newPassword || !confirmPassword) {
    return null;
  }

  if (newPassword.value !== confirmPassword.value) {

    confirmPassword.setErrors({
      ...confirmPassword.errors,
      passwordMismatch: true
    });

  } else if (
    confirmPassword.hasError('passwordMismatch')
  ) {

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

  return null;
}


@Component({
  selector: 'app-user-profile',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],

  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})

export class UserProfile implements OnInit {

  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;

  isEditMode = false;

  profileForm;

  originalProfile: any;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.profileForm = this.fb.group(
      {

        fullName: [
          '',
          Validators.required
        ],

        email: [''],

        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^[0-9]{10}$'
            )
          ]
        ],

        role: [''],

        currentPassword: [''],

        newPassword: [
          '',
          Validators.minLength(8)
        ],

        confirmPassword: ['']

      },
      {
        validators: passwordMatchValidator
      }
    );

  }


  ngOnInit(): void {

    this.loadProfile();

  }


  loadProfile() {

    this.authService
      .getCurrentUser()
      .subscribe({

        next: (user) => {

          this.originalProfile = user;

          this.profileForm.patchValue({

            fullName: user.name,

            email: user.email,

            mobile: user.mobile_number,

            role: user.role

          });

        },


        error: (error) => {

          console.error(
            'Profile Load Error:',
            error
          );

          if (error.status === 401) {

            this.logout();

          } else {

            alert(
              'Unable to load profile'
            );

          }

        }

      });

  }


  enableEdit() {

    this.isEditMode = true;

  }


  cancelEdit() {

    this.isEditMode = false;

    this.profileForm.patchValue({

      fullName:
        this.originalProfile.name,

      email:
        this.originalProfile.email,

      mobile:
        this.originalProfile.mobile_number,

      role:
        this.originalProfile.role,

      currentPassword: '',

      newPassword: '',

      confirmPassword: ''

    });

  }


  onSubmit() {

  this.profileForm.markAllAsTouched();

  if (this.profileForm.invalid) {
    return;
  }

  const formData =
    this.profileForm.getRawValue();

  const currentPassword =
    formData.currentPassword || '';

  const newPassword =
    formData.newPassword || '';

  const confirmPassword =
    formData.confirmPassword || '';

  const passwordChangeStarted =
    currentPassword ||
    newPassword ||
    confirmPassword;

  if (
    passwordChangeStarted &&
    (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    )
  ) {

    alert(
      'Please complete all password fields'
    );

    return;
  }

  this.authService
    .updateProfile(
      formData.fullName!,
      formData.mobile!
    )
    .subscribe({

      next: () => {

        if (passwordChangeStarted) {

          this.updatePasswordIfNeeded();

        } else {

          alert(
            'Profile updated successfully'
          );

          this.isEditMode = false;

          this.loadProfile();

        }

      },

      error: (error) => {

        console.error(
          'Profile Update Error:',
          error
        );

        alert(
          error.error?.detail ||
          'Profile update failed'
        );

      }

    });

}


  updatePasswordIfNeeded() {

    const formData =
      this.profileForm.getRawValue();

    const currentPassword =
      formData.currentPassword || '';

    const newPassword =
      formData.newPassword || '';

    const confirmPassword =
      formData.confirmPassword || '';


    if (
      !currentPassword &&
      !newPassword &&
      !confirmPassword
    ) {

      return;

    }


    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      alert(
        'Please complete all password fields'
      );

      return;

    }


    this.authService
      .updatePassword(
        currentPassword,
        newPassword,
        confirmPassword
      )
      .subscribe({

        next: () => {

  alert(
    'Profile and password updated successfully'
  );

  this.profileForm.patchValue({

    currentPassword: '',

    newPassword: '',

    confirmPassword: ''

  });

  this.isEditMode = false;

  this.loadProfile();

},


        error: (error) => {

          alert(
            error.error?.detail ||
            'Password update failed'
          );

        }

      });

  }


  logout() {

    localStorage.removeItem('token');

    localStorage.removeItem('role');

    this.router.navigate(['/login']);

  }

}