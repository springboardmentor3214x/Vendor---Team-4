import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './contract-details.html',
  styleUrl: './contract-details.scss'
})
export class ContractDetails {

  contract = {

    contractNumber: 'CTR-1001',

    contractTitle:
      'IT Hardware Supply Agreement',

    vendorName:
      'ABC Technologies',

    vendorId:
      'VEN-1001',

    contractType:
      'Supply Contract',

    procurementCategory:
      'IT Equipment',

    startDate:
      '01-Jan-2026',

    endDate:
      '31-Dec-2028',

    contractValue:
      '₹15,00,000',

    paymentTerms:
      '50% Advance, 50% After Delivery',

    sla:
      'Issue resolution within 24 hours.',

    warrantyDetails:
      '3 Years Manufacturer Warranty.',

    responsibleManager:
      'John Smith',

    status:
      'Active',

    remainingDays:
      '875 Days',

    lastUpdated:
      '20-Jul-2026',

    documentName:
      'signed_contract.pdf',

    uploadDate:
      '15-Jan-2026'
  };

  constructor(
    private router: Router
  ) {}

  editContract(): void {

    this.router.navigate([
      '/edit-contract',
      this.contract.contractNumber
    ]);

  }

  renewContract(): void {

    console.log(
      'Renew Contract:',
      this.contract.contractNumber
    );

    alert(
      'Contract Renewal Process Started'
    );

  }

  previewDocument(): void {

    console.log(
      'Preview Document:',
      this.contract.documentName
    );

    alert(
      'Opening Contract Preview'
    );

  }

  downloadDocument(): void {

    console.log(
      'Download Document:',
      this.contract.documentName
    );

    alert(
      'Downloading Contract Document'
    );

  }

}