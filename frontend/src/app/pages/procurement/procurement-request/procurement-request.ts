import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-procurement-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterLink
  ],
  templateUrl: './procurement-request.html',
  styleUrl: './procurement-request.scss'
})
export class ProcurementRequest implements OnInit {

  procurementForm: any;

  uploadedFiles: File[] = [];

  // Page Mode
  mode: 'create' | 'view' | 'edit' = 'create';

  requestId = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.procurementForm = this.fb.group({

      requestNumber: [
        'PR-0001'
      ],

      requestTitle: [
        '',
        Validators.required
      ],

      departmentName: [
        '',
        Validators.required
      ],

      requestedBy: [
        '',
        Validators.required
      ],

      productName: [
        '',
        Validators.required
      ],

      productCategory: [
        '',
        Validators.required
      ],

      quantity: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      unit: [
        '',
        Validators.required
      ],

      estimatedBudget: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')
        ]
      ],

      requiredDeliveryDate: [
        '',
        Validators.required
      ],

      priority: [
        'Medium',
        Validators.required
      ],

      businessJustification: [
        '',
        Validators.required
      ],

      additionalRemarks: [''],

      requestStatus: [
        'Pending'
      ]

    });

  }

  ngOnInit(): void {

    this.requestId = this.route.snapshot.paramMap.get('id') || '';

    const url = this.router.url;

    if (url.includes('/view/')) {

      this.mode = 'view';

      this.procurementForm.disable();

    }

    else if (url.includes('/edit/')) {

      this.mode = 'edit';

    }

    else {

      this.mode = 'create';

    }

    /*
      Backend Integration

      if(this.requestId){

        GET /api/procurement-request/{id}

        this.procurementForm.patchValue(response);

      }
    */

  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files) {

      for (let i = 0; i < input.files.length; i++) {

        this.uploadedFiles.push(input.files[i]);

      }

    }

  }

  removeFile(index: number): void {

    this.uploadedFiles.splice(index, 1);

  }

  saveDraft(): void {

    console.log('Draft Saved');

    console.log(this.procurementForm.value);

  }

  onSubmit(): void {

    if (this.procurementForm.invalid) {

      this.procurementForm.markAllAsTouched();

      return;

    }

    if (this.mode === 'edit') {

      console.log('Update Procurement Request');

      console.log(this.procurementForm.value);

      alert('Procurement Request Updated Successfully!');

      return;

    }

    console.log(this.procurementForm.value);

    console.log(this.uploadedFiles);

    /*
      FastAPI Integration

      POST /api/procurement-request

      Form Data +
      Supporting Documents
    */

    alert('Procurement Request Submitted Successfully!');

  }

  cancel(): void {

    this.router.navigate(['/procurement-request-list']);

  }

}