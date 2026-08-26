from datetime import date, datetime
import enum
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.procurement_request import (
    ProcurementPriority,
    ProcurementStatus,
    ApprovalStatus
)


class ProcurementRequestCreate(BaseModel):
    request_title: str
    department_name: str
    item_name: str
    product_category: str
    quantity: int = Field(gt=0)
    unit: str
    estimated_budget: float = Field(gt=0)
    required_delivery_date: date
    priority: ProcurementPriority
    business_justification: str
    additional_remarks: Optional[str] = None
    supporting_document: Optional[str] = None
    request_status: ProcurementStatus = ProcurementStatus.PENDING


class ProcurementRequestUpdate(BaseModel):
    request_title: Optional[str] = None
    department_name: Optional[str] = None
    item_name: Optional[str] = None
    product_category: Optional[str] = None
    quantity: Optional[int] = Field(default=None, gt=0)
    unit: Optional[str] = None
    estimated_budget: Optional[float] = Field(default=None, gt=0)
    required_delivery_date: Optional[date] = None
    priority: Optional[ProcurementPriority] = None
    business_justification: Optional[str] = None
    additional_remarks: Optional[str] = None
    supporting_document: Optional[str] = None
    request_status: Optional[ProcurementStatus] = None


class ProcurementRequestResponse(BaseModel):
    id: int
    request_number: str
    request_title: str
    department_name: str
    requested_by: int
    vendor_id: Optional[int]
    item_name: str
    product_category: str
    quantity: int
    unit: str
    estimated_budget: float
    required_delivery_date: date
    priority: ProcurementPriority
    business_justification: str
    additional_remarks: Optional[str]
    supporting_document: Optional[str]
    request_status: ProcurementStatus
    approval_status: ApprovalStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProcurementRequestListResponse(BaseModel):
    total: int
    page: int
    size: int
    total_pages: int
    items: List[ProcurementRequestResponse]


class ProcurementApprovalResponse(BaseModel):
    message: str
    request_id: int
    request_status: ProcurementStatus
    approval_status: ApprovalStatus
    approval_remarks: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None

class ProcurementApprovalRequest(BaseModel):
    remarks: Optional[str] = None


class ProcurementRejectionRequest(BaseModel):
    remarks: str

class ProcurementSendBackRequest(BaseModel):
    remarks: str

class ProcurementDashboardResponse(BaseModel):
    total_requests: int
    draft_requests: int = 0
    pending_requests: int
    approved_requests: int
    rejected_requests: int
    completed_requests: int
    cancelled_requests: int
    total_estimated_budget: float = 0
    average_estimated_budget: float = 0
class VendorAssignmentRequest(BaseModel):
    vendor_id: int


class VendorAssignmentResponse(BaseModel):
    message: str
    request_id: int
    vendor_id: int
    company_name: str

class AssignedVendorResponse(BaseModel):
    request_id: int
    request_number: str
    vendor_id: int
    vendor_code: str
    company_name: str
    vendor_status: str
    approval_status: str

class ApprovedVendorResponse(BaseModel):
    id: int
    vendor_id: str
    company_name: str
    vendor_category: str
    contact_person: str
    designation: str
    email: str
    phone: str
    vendor_status: str