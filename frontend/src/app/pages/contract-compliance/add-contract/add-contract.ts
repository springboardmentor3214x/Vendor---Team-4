import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-contract',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,

    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './add-contract.html',
  styleUrl: './add-contract.scss'
})
export class AddContract implements OnInit {

  contractForm!: FormGroup;

  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.contractForm = this.fb.group({

      contractNumber: ['', Validators.required],

      contractTitle: ['', Validators.required],

      contractType: ['', Validators.required],

      procurementCategory: [''],

      vendorName: ['', Validators.required],

      vendorId: ['', Validators.required],

      responsibleManager: [''],

      startDate: ['', Validators.required],

      endDate: ['', Validators.required],

      contractValue: ['', Validators.required],

      paymentTerms: [''],

      sla: [''],

      warrantyDetails: [''],

      status: ['Draft']

    });

  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {

      alert(
        'Only PDF, DOC and DOCX files are allowed.'
      );

      input.value = '';

      return;

    }

    this.selectedFile = file;

    console.log(
      'Selected File:',
      file.name
    );

  }

  onSubmit(): void {

    if (this.contractForm.invalid) {

      this.contractForm.markAllAsTouched();

      return;

    }

    const startDate =
      new Date(this.contractForm.value.startDate);

    const endDate =
      new Date(this.contractForm.value.endDate);

    if (endDate < startDate) {

      alert(
        'End Date cannot be earlier than Start Date.'
      );

      return;

    }

    const contractData = {

      ...this.contractForm.value,

      uploadedFile: this.selectedFile
        ? this.selectedFile.name
        : null

    };

    console.log(
      'Contract Data:',
      contractData
    );

    alert(
      'Contract Created Successfully'
    );

    this.contractForm.reset({

      status: 'Draft'

    });

    this.selectedFile = null;

  }

}