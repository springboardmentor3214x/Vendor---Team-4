import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { VendorService } from '../../../services/vendor.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.scss'
})
export class VendorDashboard implements OnInit {

  constructor(private router: Router, private vendorService: VendorService) {}

  // ==========================
  // Vendor Information
  // ==========================

  companyName = '-';

  vendorId = '-';

  contactPerson = '-';

  email = '-';

  phone = '-';

  address = '-';

  // ==========================
  // Dashboard Summary
  // ==========================

  vendorCategory = '-';

  vendorStatus = '-';

  approvalStatus = '-';

  vendorRating = 0;

  reliabilityScore = 0;

  totalSales = '₹0';

  revenue = '₹0';

  completedOrders = 0;

  pendingOrders = 0;

  contracts = 0;

  registrationDate = '-';

  onTimeDelivery = '0%';

  riskLevel = '-';

  // ==========================
  // Recent Activity
  // ==========================

  recentActivities: string[] = [];

  // ==========================
  // Notifications
  // ==========================

  notifications: string[] = [];

  ngOnInit(): void {
    this.vendorService.getVendorMeDashboard().subscribe({
      next: (data) => {
        const v = data?.vendor || {};
        this.companyName = v.company_name || '-';
        this.vendorId = v.vendor_id || '-';
        this.contactPerson = v.contact_person || '-';
        this.email = v.email || '-';
        this.phone = v.phone || '-';
        this.address = [v.city, v.state, v.country].filter(Boolean).join(', ') || '-';
        this.vendorCategory = data?.vendor_category || '-';
        this.vendorStatus = data?.vendor_status || '-';
        this.approvalStatus = data?.approval_status || '-';
        this.reliabilityScore = Number(data?.reliability_score ?? 0);
        this.vendorRating = Number(data?.performance_score ?? 0) / 20;
        this.completedOrders = Number(data?.completed_orders ?? 0);
        this.pendingOrders = Number(data?.active_purchase_orders ?? 0);
        this.onTimeDelivery = `${Number(data?.on_time_delivery ?? 0)}%`;
        this.riskLevel = this.reliabilityScore >= 90 ? 'Low' : this.reliabilityScore >= 60 ? 'Medium' : 'High';
      },
      error: (error) => console.error('Failed to load vendor dashboard:', error)
    });
  }

  // ==========================
  // Navigation
  // ==========================

  goToProfile() {

    this.router.navigate(['/profile']);

  }

  goToOrders() {

    this.router.navigate(['/purchase-orders']);

  }

  goToNotifications() {

    this.router.navigate(['/notifications']);

  }

  logout() {

    localStorage.removeItem('token');

    localStorage.removeItem('role');

    this.router.navigate(['/login']);

  }

}