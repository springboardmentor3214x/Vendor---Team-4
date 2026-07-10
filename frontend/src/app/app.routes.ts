import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

// Authentication
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { ResetPassword } from './pages/auth/reset-password/reset-password';

// Profile
import { UserProfile } from './pages/profile/user-profile/user-profile';

// Dashboards
import { AdminDashboard } from './pages/dashboard/admin-dashboard/admin-dashboard';
import { ProcurementDashboard } from './pages/dashboard/procurement-dashboard/procurement-dashboard';
import { SupplyChainDashboard } from './pages/dashboard/supply-chain-dashboard/supply-chain-dashboard';
import { VendorDashboard } from './pages/dashboard/vendor-dashboard/vendor-dashboard';
import { FinanceDashboard } from './pages/dashboard/finance-dashboard/finance-dashboard';
import { AuditorDashboard } from './pages/dashboard/auditor-dashboard/auditor-dashboard';

// Vendor Module
import { VendorManagement } from './pages/vendor/vendor-management/vendor-management';
import { VendorList } from './pages/vendor/vendor-list/vendor-list';
import { AddVendor } from './pages/vendor/add-vendor/add-vendor';
import { VendorDetails } from './pages/vendor/vendor-details/vendor-details';
import { EditVendor } from './pages/vendor/edit-vendor/edit-vendor';
import { VendorApproval } from './pages/vendor/vendor-approval/vendor-approval';

// Procurement
import { ProcurementDashboard as ProcurementModuleDashboard } from './pages/procurement/procurement-dashboard/procurement-dashboard';

// Purchase Orders
import { PurchaseOrders } from './pages/purchase-orders/purchase-orders/purchase-orders';

// Vendor Performance
import { VendorPerformance } from './pages/vendor-performance/vendor-performance/vendor-performance';

// Analytics
import { Analytics } from './pages/analytics/analytics/analytics';

// Reports
import { Reports } from './pages/reports/reports/reports';

// Notifications
import { Notifications } from './pages/notifications/notifications/notifications';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Authentication

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },

  {
    path: 'forgot-password',
    component: ForgotPassword
  },

  {
    path: 'reset-password',
    component: ResetPassword
  },

  // Profile

  {
    path: 'profile',
    component: UserProfile
  },

  // Dashboards

  {
  path: 'admin-dashboard',
  component: AdminDashboard,
  canActivate: [authGuard, roleGuard],
  data: {
    roles: ['Administrator']
  }
},
  
 /* {
  path: 'admin-dashboard',
  component: AdminDashboard,
  canActivate: [authGuard]
  },*/

  {
    path: 'admin-dashboard',
    component: AdminDashboard
  },

  {
    path: 'procurement-dashboard',
    component: ProcurementDashboard
  },

  {
    path: 'supply-chain-dashboard',
    component: SupplyChainDashboard
  },

  {
    path: 'vendor-dashboard',
    component: VendorDashboard
  },

  {
    path: 'finance-dashboard',
    component: FinanceDashboard
  },

  {
    path: 'auditor-dashboard',
    component: AuditorDashboard
  },

  // Vendor Module

  {
    path: 'vendor-management',
    component: VendorManagement
  },

  {
    path: 'vendor-list',
    component: VendorList
  },

  {
    path: 'add-vendor',
    component: AddVendor
  },

  {
    path: 'vendor-details/:id',
    component: VendorDetails
  },

  {
    path: 'edit-vendor/:id',
    component: EditVendor
  },

  {
    path: 'vendor-approval',
    component: VendorApproval
  },

  // Procurement Module

  {
    path: 'procurement-management',
    component: ProcurementModuleDashboard
  },

  // Purchase Orders

  {
    path: 'purchase-orders',
    component: PurchaseOrders
  },

  // Vendor Performance

  {
    path: 'vendor-performance',
    component: VendorPerformance
  },

  // Analytics

  {
    path: 'analytics',
    component: Analytics
  },

  // Reports

  {
    path: 'reports',
    component: Reports
  },

  // Notifications

  {
    path: 'notifications',
    component: Notifications
  },

  // Invalid URL

  {
    path: '**',
    redirectTo: 'login'
  }

];