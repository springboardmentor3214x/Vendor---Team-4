from pydantic import BaseModel


class DashboardOverviewResponse(BaseModel):

    total_vendors: int

    active_vendors: int

    pending_vendors: int

    total_procurement_requests: int

    pending_procurement_requests: int

    approved_procurement_requests: int

    total_purchase_orders: int

    pending_purchase_orders: int

    completed_purchase_orders: int

    cancelled_purchase_orders: int

class VendorDashboardResponse(BaseModel):

    total_vendors: int

    active_vendors: int

    pending_vendors: int

    inactive_vendors: int

    suspended_vendors: int

    approved_vendors: int

    rejected_vendors: int

    pending_approval_vendors: int

    average_reliability_score: float

    average_performance_score: float

class ProcurementDashboardResponse(BaseModel):

    total_requests: int

    draft_requests: int

    pending_requests: int

    approved_requests: int

    rejected_requests: int

    completed_requests: int

    cancelled_requests: int

    total_estimated_budget: float

    average_estimated_budget: float

class DeliveryDashboardResponse(BaseModel):

    total_deliveries: int

    early_deliveries: int

    on_time_deliveries: int

    delayed_deliveries: int

    average_delay_days: float

class ContractDashboardResponse(BaseModel):

    total_contracts: int

    active_contracts: int

    expired_contracts: int

    renewed_contracts: int

    terminated_contracts: int

    expiring_soon_contracts: int

class CommunicationDashboardResponse(BaseModel):

    total_messages: int

    unread_messages: int

    total_discussions: int

    total_shared_files: int

    total_activity_logs: int

class AdminDashboardResponse(BaseModel):

    total_users: int

    total_vendors: int

    total_procurement_requests: int

    total_purchase_orders: int

    total_contracts: int

    total_messages: int

    total_discussions: int

    total_shared_files: int

    total_activity_logs: int