import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-contract',
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
  templateUrl: './edit-contract.html',
  styleUrl: './edit-contract.scss'
})
export class EditContract implements OnInit {

  contractForm!: FormGroup;

  selectedFile: File | null = null;

  contractId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.contractId =
      this.route.snapshot.paramMap.get('id') || '';

    this.contractForm = this.fb.group({

      contractNumber: [
        'CTR-1001',
        [Validators.required]
      ],

      contractTitle: [
        'IT Hardware Supply Agreement',
        [Validators.required]
      ],

      contractType: [
        'Supply',
        [Validators.required]
      ],

      procurementCategory: [
        'IT Equipment'
      ],

      vendorName: [
        'ABC Technologies',
        [Validators.required]
      ],

      vendorId: [
        'VEN-1001',
        [Validators.required]
      ],

      responsibleManager: [
        'John Smith'
      ],

      startDate: [
        new Date('2026-01-01'),
        [Validators.required]
      ],

      endDate: [
        new Date('2028-12-31'),
        [Validators.required]
      ],

      contractValue: [
        1500000,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      paymentTerms: [
        '50% Advance, 50% After Delivery'
      ],

      sla: [
        'Issue resolution within 24 hours'
      ],

      warrantyDetails: [
        '3 Years Manufacturer Warranty'
      ],

      status: [
        'Active',
        [Validators.required]
      ]

    });

  }

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file =
      input.files[0];

    const allowedTypes = [

      'application/pdf',

      'application/msword',

      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    ];

    if (
      !allowedTypes.includes(file.type)
    ) {

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

  updateContract(): void {

    if (
      this.contractForm.invalid
    ) {

      this.contractForm.markAllAsTouched();

      return;

    }

    const startDate =
      this.contractForm.value.startDate;

    const endDate =
      this.contractForm.value.endDate;

    if (
      endDate < startDate
    ) {

      alert(
        'End Date cannot be before Start Date'
      );

      return;

    }

    const updatedContract = {

      id: this.contractId,

      ...this.contractForm.value,

      uploadedFile:
        this.selectedFile
          ? this.selectedFile.name
          : null

    };

    console.log(
      'Updated Contract:',
      updatedContract
    );

    alert(
      'Contract Updated Successfully'
    );

    this.router.navigate([
      '/contract-repository'
    ]);

  }

}