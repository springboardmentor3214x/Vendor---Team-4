import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

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

export class UserProfile {

  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;

  profileForm;

  constructor(private fb: FormBuilder) {

    this.profileForm = this.fb.group({

      fullName: [
        'Exampl user',
        Validators.required
      ],

      email: [
        {
          value: 'example@example.com',
          disabled: true
        }
      ],

      mobile: [
        '9999999999',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      role: [
        {
          value: 'Administrator',
          disabled: true
        }
      ],

      currentPassword: [''],

      newPassword: [
        '',
        Validators.minLength(8)
      ],

      confirmPassword: ['']

    },
    {
      validators: passwordMatchValidator
    });

  }

  onSubmit() {

    if (this.profileForm.invalid) {
      return;
    }

    console.log(this.profileForm.getRawValue());

  }

}