import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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
export class VendorDashboard {

  constructor(private router: Router) {}

  // ==========================
  // Vendor Information
  // ==========================

  companyName = 'Tech Solutions Pvt Ltd';

  vendorId = 'VEN-1001';

  contactPerson = 'Rahul Sharma';

  email = 'vendor@gmail.com';

  phone = '+91 9876543210';

  address = 'Kolkata, West Bengal, India';

  // ==========================
  // Dashboard Summary
  // ==========================

  vendorCategory = 'IT Vendor';

  vendorStatus = 'Active';

  approvalStatus = 'Approved';

  vendorRating = 4.8;

  reliabilityScore = 92;

  totalSales = '₹18.75 Lakh';

  revenue = '₹18.75 Lakh';

  completedOrders = 145;

  pendingOrders = 8;

  contracts = 12;

  registrationDate = '12 July 2026';

  onTimeDelivery = '96%';

  riskLevel = 'Low';

  // ==========================
  // Recent Activity
  // ==========================

  recentActivities = [

    'Purchase Order PO-1032 Assigned',

    'Payment of ₹75,000 Received',

    'Vendor Profile Updated',

    'New Contract Approved'

  ];

  // ==========================
  // Notifications
  // ==========================

  notifications = [

    'Annual Vendor Review scheduled next month.',

    'Purchase Order PO-1040 is pending.',

    'Reliability Score increased to 92%.',

    'New message received from Procurement.'

  ];

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