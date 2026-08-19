from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.vendor import Vendor, VendorStatus
from app.models.procurement_request import (
    ProcurementRequest,
    ProcurementStatus
)
from app.models.purchase_order import (
    PurchaseOrder,
    PurchaseOrderStatus
)
from app.models.delivery_performance import (
    DeliveryPerformance,
    DeliveryStatus
)
from datetime import date, timedelta

from app.models.contract import (
    Contract,
    ContractStatus
)
from app.models.message import Message
from app.models.discussion import Discussion
from app.models.file_share import FileShare
from app.models.activity_log import ActivityLog

from app.models.user import User
from app.models.vendor_reliability import VendorReliability
from app.models.vendor_performance import VendorPerformance
from app.models.vendor import ApprovalStatus

def get_dashboard_overview(db: Session):

    total_vendors = db.query(func.count(Vendor.id)).scalar()

    active_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.vendor_status == VendorStatus.ACTIVE
    ).scalar()

    pending_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.vendor_status == VendorStatus.PENDING
    ).scalar()

    total_procurement_requests = db.query(
        func.count(ProcurementRequest.id)
    ).scalar()

    pending_procurement_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.PENDING
    ).scalar()

    approved_procurement_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.APPROVED
    ).scalar()

    total_purchase_orders = db.query(
        func.count(PurchaseOrder.id)
    ).scalar()

    pending_purchase_orders = db.query(
        func.count(PurchaseOrder.id)
    ).filter(
        PurchaseOrder.status == PurchaseOrderStatus.PENDING
    ).scalar()

    completed_purchase_orders = db.query(
        func.count(PurchaseOrder.id)
    ).filter(
        PurchaseOrder.status == PurchaseOrderStatus.COMPLETED
    ).scalar()

    cancelled_purchase_orders = db.query(
        func.count(PurchaseOrder.id)
    ).filter(
        PurchaseOrder.status == PurchaseOrderStatus.CANCELLED
    ).scalar()

    return {
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "pending_vendors": pending_vendors,
        "total_procurement_requests": total_procurement_requests,
        "pending_procurement_requests": pending_procurement_requests,
        "approved_procurement_requests": approved_procurement_requests,
        "total_purchase_orders": total_purchase_orders,
        "pending_purchase_orders": pending_purchase_orders,
        "completed_purchase_orders": completed_purchase_orders,
        "cancelled_purchase_orders": cancelled_purchase_orders
    }
def get_vendor_dashboard(db: Session):

    total_vendors = db.query(func.count(Vendor.id)).scalar()

    active_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.vendor_status == VendorStatus.ACTIVE
    ).scalar()

    pending_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.vendor_status == VendorStatus.PENDING
    ).scalar()

    inactive_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.vendor_status == VendorStatus.INACTIVE
    ).scalar()

    suspended_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.vendor_status == VendorStatus.SUSPENDED
    ).scalar()

    approved_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.approval_status == ApprovalStatus.APPROVED
    ).scalar()

    rejected_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.approval_status == ApprovalStatus.REJECTED
    ).scalar()

    pending_approval_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.approval_status == ApprovalStatus.PENDING
    ).scalar()

    average_reliability_score = db.query(
        func.avg(VendorReliability.reliability_score)
    ).scalar() or 0

    average_performance_score = db.query(
        func.avg(VendorPerformance.overall_vendor_score)
    ).scalar() or 0

    return {
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "pending_vendors": pending_vendors,
        "inactive_vendors": inactive_vendors,
        "suspended_vendors": suspended_vendors,
        "approved_vendors": approved_vendors,
        "rejected_vendors": rejected_vendors,
        "pending_approval_vendors": pending_approval_vendors,
        "average_reliability_score": round(
            average_reliability_score,
            2
        ),
        "average_performance_score": round(
            average_performance_score,
            2
        )
    }

def get_procurement_dashboard(db: Session):

    total_requests = db.query(
        func.count(ProcurementRequest.id)
    ).scalar()

    draft_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.DRAFT
    ).scalar()

    pending_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.PENDING
    ).scalar()

    approved_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.APPROVED
    ).scalar()

    rejected_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.REJECTED
    ).scalar()

    completed_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.COMPLETED
    ).scalar()

    cancelled_requests = db.query(
        func.count(ProcurementRequest.id)
    ).filter(
        ProcurementRequest.request_status == ProcurementStatus.CANCELLED
    ).scalar()

    total_estimated_budget = db.query(
        func.sum(ProcurementRequest.estimated_budget)
    ).scalar() or 0

    average_estimated_budget = db.query(
        func.avg(ProcurementRequest.estimated_budget)
    ).scalar() or 0

    return {
        "total_requests": total_requests,
        "draft_requests": draft_requests,
        "pending_requests": pending_requests,
        "approved_requests": approved_requests,
        "rejected_requests": rejected_requests,
        "completed_requests": completed_requests,
        "cancelled_requests": cancelled_requests,
        "total_estimated_budget": round(
            total_estimated_budget,
            2
        ),
        "average_estimated_budget": round(
            average_estimated_budget,
            2
        )
    }
def get_delivery_dashboard(db: Session):

    total_deliveries = db.query(
        func.count(DeliveryPerformance.id)
    ).scalar()

    early_deliveries = db.query(
        func.count(DeliveryPerformance.id)
    ).filter(
        DeliveryPerformance.delivery_status == DeliveryStatus.EARLY
    ).scalar()

    on_time_deliveries = db.query(
        func.count(DeliveryPerformance.id)
    ).filter(
        DeliveryPerformance.delivery_status == DeliveryStatus.ON_TIME
    ).scalar()

    delayed_deliveries = db.query(
        func.count(DeliveryPerformance.id)
    ).filter(
        DeliveryPerformance.delivery_status == DeliveryStatus.DELAYED
    ).scalar()

    average_delay_days = db.query(
        func.avg(DeliveryPerformance.delay_days)
    ).scalar() or 0

    return {
        "total_deliveries": total_deliveries,
        "early_deliveries": early_deliveries,
        "on_time_deliveries": on_time_deliveries,
        "delayed_deliveries": delayed_deliveries,
        "average_delay_days": round(
            average_delay_days,
            2
        )
    }
def get_contract_dashboard(db: Session):

    today = date.today()

    next_30_days = today + timedelta(days=30)

    total_contracts = db.query(
        func.count(Contract.id)
    ).scalar()

    active_contracts = db.query(
        func.count(Contract.id)
    ).filter(
        Contract.status == ContractStatus.ACTIVE
    ).scalar()

    expired_contracts = db.query(
        func.count(Contract.id)
    ).filter(
        Contract.status == ContractStatus.EXPIRED
    ).scalar()

    renewed_contracts = db.query(
        func.count(Contract.id)
    ).filter(
        Contract.status == ContractStatus.RENEWED
    ).scalar()

    terminated_contracts = db.query(
        func.count(Contract.id)
    ).filter(
        Contract.status == ContractStatus.TERMINATED
    ).scalar()

    expiring_soon_contracts = db.query(
        func.count(Contract.id)
    ).filter(
        Contract.end_date >= today,
        Contract.end_date <= next_30_days
    ).scalar()

    return {
        "total_contracts": total_contracts,
        "active_contracts": active_contracts,
        "expired_contracts": expired_contracts,
        "renewed_contracts": renewed_contracts,
        "terminated_contracts": terminated_contracts,
        "expiring_soon_contracts": expiring_soon_contracts
    }

def get_communication_dashboard(db: Session):

    total_messages = db.query(
        func.count(Message.id)
    ).scalar()

    unread_messages = db.query(
        func.count(Message.id)
    ).filter(
        Message.is_read == False
    ).scalar()

    total_discussions = db.query(
        func.count(Discussion.id)
    ).scalar()

    total_shared_files = db.query(
        func.count(FileShare.id)
    ).scalar()

    total_activity_logs = db.query(
        func.count(ActivityLog.id)
    ).scalar()

    return {
        "total_messages": total_messages,
        "unread_messages": unread_messages,
        "total_discussions": total_discussions,
        "total_shared_files": total_shared_files,
        "total_activity_logs": total_activity_logs
    }

def get_admin_dashboard(db: Session):

    total_users = db.query(
        func.count(User.id)
    ).scalar()

    total_vendors = db.query(
        func.count(Vendor.id)
    ).scalar()

    total_procurement_requests = db.query(
        func.count(ProcurementRequest.id)
    ).scalar()

    total_purchase_orders = db.query(
        func.count(PurchaseOrder.id)
    ).scalar()

    total_contracts = db.query(
        func.count(Contract.id)
    ).scalar()

    total_messages = db.query(
        func.count(Message.id)
    ).scalar()

    total_discussions = db.query(
        func.count(Discussion.id)
    ).scalar()

    total_shared_files = db.query(
        func.count(FileShare.id)
    ).scalar()

    total_activity_logs = db.query(
        func.count(ActivityLog.id)
    ).scalar()

    return {
        "total_users": total_users,
        "total_vendors": total_vendors,
        "total_procurement_requests": total_procurement_requests,
        "total_purchase_orders": total_purchase_orders,
        "total_contracts": total_contracts,
        "total_messages": total_messages,
        "total_discussions": total_discussions,
        "total_shared_files": total_shared_files,
        "total_activity_logs": total_activity_logs
    }