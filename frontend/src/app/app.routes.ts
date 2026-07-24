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
import { VendorDashboard as VendorHome } from './pages/vendor/vendor-dashboard/vendor-dashboard';

// Procurement
import { ProcurementDashboard as ProcurementModuleDashboard } from './pages/procurement/procurement-dashboard/procurement-dashboard';
import { ProcurementRequestList } from './pages/procurement/procurement-request-list/procurement-request-list';
import { ProcurementRequest } from './pages/procurement/procurement-request/procurement-request';
import { ProcurementApproval } from './pages/procurement/procurement-approval/procurement-approval';
import { VendorAssignment } from './pages/procurement/vendor-assignment/vendor-assignment';
import { PurchaseOrderCreation } from './pages/procurement/purchase-order-creation/purchase-order-creation';
import { PurchaseOrderDetails } from './pages/procurement/purchase-order-details/purchase-order-details';
import { ProcurementStatus } from './pages/procurement/procurement-status/procurement-status';
import { OrderTracking } from './pages/procurement/order-tracking/order-tracking';
import { InvoiceManagement } from './pages/procurement/invoice-management/invoice-management';

// Purchase Orders
import { PurchaseOrders } from './pages/purchase-orders/purchase-orders/purchase-orders';

// Vendor Performance
import { VendorPerformance } from './pages/vendor-performance/vendor-performance/vendor-performance';
import { VendorPerformanceDashboard } from './pages/vendor-performance/vendor-performance-dashboard/vendor-performance-dashboard';
import { DeliveryPerformance } from './pages/vendor-performance/delivery-performance/delivery-performance';
import { ProductQualityEvaluation } from './pages/vendor-performance/product-quality-evaluation/product-quality-evaluation';
import { CommunicationTracking } from './pages/vendor-performance/communication-tracking/communication-tracking';
import { ServiceRating } from './pages/vendor-performance/service-rating/service-rating';
import { PerformanceHistory } from './pages/vendor-performance/performance-history/performance-history';
import { VendorRanking } from './pages/vendor-performance/vendor-ranking/vendor-ranking';

// Analytics
import { Analytics } from './pages/analytics/analytics/analytics';

// Reports
import { Reports } from './pages/reports/reports/reports';

// Notifications
import { Notifications } from './pages/notifications/notifications/notifications';



import { VendorReliabilityDashboard } from './pages/vendor-reliability/vendor-reliability-dashboard/vendor-reliability-dashboard';
import { ReliabilityScore } from './pages/vendor-reliability/reliability-score/reliability-score';
import { SupplierRanking } from './pages/vendor-reliability/supplier-ranking/supplier-ranking';
import { ProcurementRiskDashboard } from './pages/vendor-reliability/procurement-risk-dashboard/procurement-risk-dashboard';
import { PerformanceTrendAnalysis } from './pages/vendor-reliability/performance-trend-analysis/performance-trend-analysis';
import { ProcurementRecommendations } from './pages/vendor-reliability/procurement-recommendations/procurement-recommendations';

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
  component: UserProfile,
  canActivate: [authGuard]
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

{
  path: 'procurement-dashboard',
  component: ProcurementDashboard,
  canActivate: [authGuard, roleGuard],
  data: {
    roles: ['Procurement Manager']
  }
},

{
  path: 'supply-chain-dashboard',
  component: SupplyChainDashboard,
  canActivate: [authGuard, roleGuard],
  data: {
    roles: ['Supply Chain Manager']
  }
},

{
  path: 'vendor-dashboard',
  component: VendorDashboard,
  canActivate: [authGuard, roleGuard],
  data: {
    roles: ['Vendor']
  }
},

{
  path: 'finance-dashboard',
  component: FinanceDashboard,
  canActivate: [authGuard, roleGuard],
  data: {
    roles: ['Finance Officer']
  }
},

{
  path: 'auditor-dashboard',
  component: AuditorDashboard,
  canActivate: [authGuard, roleGuard],
  data: {
    roles: ['Auditor']
  }
},

  // Vendor Module

  {
    path: 'vendor-home',
    component: VendorHome
  },

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

  {
  path: 'procurement-request',
  component: ProcurementRequest
},
{
  path: 'procurement-request/view/:id',
  component: ProcurementRequest
},
{
  path: 'procurement-request/edit/:id',
  component: ProcurementRequest
},

{
  path: 'procurement-request-list',
  component: ProcurementRequestList
},

{
  path: 'procurement-approval',
  component: ProcurementApproval
},

{
  path: 'vendor-assignment',
  component: VendorAssignment
},

{
  path: 'purchase-order-creation',
  component: PurchaseOrderCreation
},

{
  path: 'purchase-order-details',
  component: PurchaseOrderDetails
},

{
  path: 'procurement-status',
  component: ProcurementStatus
},

{
  path: 'order-tracking',
  component: OrderTracking
},

{
  path: 'invoice-management',
  component: InvoiceManagement
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

  {
  path: 'vendor-performance-dashboard',
  component: VendorPerformanceDashboard
},

{
  path: 'delivery-performance',
  component: DeliveryPerformance
},

{
  path: 'product-quality-evaluation',
  component: ProductQualityEvaluation
},
{
  path: 'communication-tracking',
  component: CommunicationTracking
},
{
  path: 'service-rating',
  component: ServiceRating
},
{
  path: 'performance-history',
  component: PerformanceHistory
},
{
  path: 'vendor-ranking',
  component: VendorRanking
},

//

{
  path: 'vendor-reliability-dashboard',
  component: VendorReliabilityDashboard
},
{
  path: 'reliability-score',
  component: ReliabilityScore
},

{
  path: 'supplier-ranking',
  component: SupplierRanking
},

{
  path: 'procurement-risk-dashboard',
  component: ProcurementRiskDashboard
},
{
  path: 'performance-trend-analysis',
  component: PerformanceTrendAnalysis
},
{
  path: 'procurement-recommendations',
  component: ProcurementRecommendations
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