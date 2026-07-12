import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vendor-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './vendor-management.html',
  styleUrl: './vendor-management.scss'
})
export class VendorManagement {

  constructor(private router: Router) {}

  totalVendors = 0;
  approved = 0;
  pending = 0;
  rejected = 0;

  openVendorList() {
    this.router.navigate(['/vendor-list']);
  }

  addVendor() {
    this.router.navigate(['/add-vendor']);
  }

  approval() {
    this.router.navigate(['/vendor-approval']);
  }

  documents() {
    this.router.navigate(['/vendor-list']);
  }

}