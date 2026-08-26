import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardOverviewData {
  total_vendors: number;
  active_vendors: number;
  pending_vendors: number;
  total_procurement_requests: number;
  pending_procurement_requests: number;
  approved_procurement_requests: number;
  total_purchase_orders: number;
  pending_purchase_orders: number;
  completed_purchase_orders: number;
  cancelled_purchase_orders: number;
}

export interface VendorDashboardData {
  total_vendors: number;
  active_vendors: number;
  pending_vendors: number;
  inactive_vendors: number;
  suspended_vendors: number;
  approved_vendors: number;
  rejected_vendors: number;
  pending_approval_vendors: number;
  average_reliability_score: number;
  average_performance_score: number;
}

export interface ProcurementDashboardData {
  total_requests: number;
  draft_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  completed_requests: number;
  cancelled_requests: number;
  total_estimated_budget: number;
  average_estimated_budget: number;
}

export interface DeliveryDashboardData {
  total_deliveries: number;
  early_deliveries: number;
  on_time_deliveries: number;
  delayed_deliveries: number;
  average_delay_days: number;
}

export interface ContractDashboardData {
  total_contracts: number;
  active_contracts: number;
  expired_contracts: number;
  renewed_contracts: number;
  terminated_contracts: number;
  expiring_soon_contracts: number;
}

export interface CommunicationDashboardData {
  total_messages: number;
  unread_messages: number;
  total_discussions: number;
  total_shared_files: number;
  total_activity_logs: number;
}

export interface AdminDashboardData {
  total_users: number;
  total_vendors: number;
  total_procurement_requests: number;
  total_purchase_orders: number;
  total_contracts: number;
  total_messages: number;
  total_discussions: number;
  total_shared_files: number;
  total_activity_logs: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardOverview(): Observable<DashboardOverviewData> {
    return this.http.get<DashboardOverviewData>(`${this.baseUrl}/dashboard/overview`);
  }

  getVendorDashboard(): Observable<VendorDashboardData> {
    return this.http.get<VendorDashboardData>(`${this.baseUrl}/dashboard/vendors`);
  }

  getProcurementDashboard(): Observable<ProcurementDashboardData> {
    return this.http.get<ProcurementDashboardData>(`${this.baseUrl}/dashboard/procurement`);
  }

  getDeliveryDashboard(): Observable<DeliveryDashboardData> {
    return this.http.get<DeliveryDashboardData>(`${this.baseUrl}/dashboard/delivery`);
  }

  getContractDashboard(): Observable<ContractDashboardData> {
    return this.http.get<ContractDashboardData>(`${this.baseUrl}/dashboard/contracts`);
  }

  getCommunicationDashboard(): Observable<CommunicationDashboardData> {
    return this.http.get<CommunicationDashboardData>(`${this.baseUrl}/dashboard/communication`);
  }

  getAdminDashboard(): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.baseUrl}/dashboard/admin`);
  }
}
