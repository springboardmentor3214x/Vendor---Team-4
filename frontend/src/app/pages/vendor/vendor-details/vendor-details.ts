import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { VendorService } from '../../../services/vendor.service';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './vendor-details.html',
  styleUrl: './vendor-details.scss'
})
export class VendorDetails implements OnInit {

  vendor: any = {};

  documents = [
    'GST Certificate.pdf',
    'PAN Card.pdf',
    'Registration Certificate.pdf',
    'ISO Certificate.pdf'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    console.log("Route ID:", id);

    this.vendorService.getVendorById(id).subscribe({

      next: (response: any) => {

        console.log("Vendor Response:", response);

        this.vendor = response;

        // Force Angular to refresh the UI
        this.cdr.detectChanges();

      },

      error: (err: any) => {

        console.error("Vendor Error:", err);

      }

    });

  }

  back(): void {
    this.router.navigate(['/vendor-list']);
  }

  editVendor(): void {
    this.router.navigate(['/edit-vendor', this.vendor.id]);
  }

}