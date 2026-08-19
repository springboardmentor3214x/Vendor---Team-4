from math import ceil
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func

from app.database import get_db
from app.models.procurement_request import (
    ProcurementRequest,
    ProcurementPriority,
    ProcurementStatus,
    ApprovalStatus
)
from app.models.user import User
from app.schemas.procurement import (
    ProcurementRequestCreate,
    ProcurementRequestUpdate,
    ProcurementRequestResponse,
    ProcurementRequestListResponse,
    ProcurementDashboardResponse,
    ProcurementApprovalRequest,
    ProcurementApprovalResponse,
    ProcurementRejectionRequest,
    ProcurementSendBackRequest,
    VendorAssignmentRequest,
    VendorAssignmentResponse,
    AssignedVendorResponse,
    ApprovedVendorResponse,
)

from app.auth import get_current_user
from app.models.purchase_order import PurchaseOrder

from app.schemas.procurement_status import (
    ProcurementStatusDashboard,
    ProcurementStatusResponse
)

from app.models.vendor import (
    Vendor,
    VendorStatus,
    ApprovalStatus as VendorApprovalStatus
)

def generate_request_number(db: Session):
    last_request = (
        db.query(ProcurementRequest)
        .order_by(ProcurementRequest.id.desc())
        .first()
    )

    if last_request:
        last_number = int(last_request.request_number.replace("PR", ""))
        return f"PR{last_number + 1:06d}"

    return "PR000001"
router = APIRouter(
    prefix="/procurement",
    tags=["Procurement Management"]
)
@router.post(
    "",
    response_model=ProcurementRequestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_procurement_request(
    request: ProcurementRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if request.required_delivery_date < datetime.today().date():
        raise HTTPException(
            status_code=400,
            detail="Required delivery date cannot be in the past."
        )

    request_number = generate_request_number(db)

    procurement = ProcurementRequest(
        request_number=request_number,
        request_title=request.request_title,
        department_name=request.department_name,
        requested_by=current_user.id,
        item_name=request.item_name,
        product_category=request.product_category,
        quantity=request.quantity,
        unit=request.unit,
        estimated_budget=request.estimated_budget,
        required_delivery_date=request.required_delivery_date,
        priority=request.priority,
        business_justification=request.business_justification,
        additional_remarks=request.additional_remarks,
        supporting_document=request.supporting_document,
        request_status=request.request_status,
        approval_status=ApprovalStatus.PENDING
    )

    db.add(procurement)
    db.commit()
    db.refresh(procurement)

    return procurement
@router.get(
    "",
    response_model=ProcurementRequestListResponse
)
def get_procurement_requests(
    search: str = Query(None),
    department: str = Query(None),
    status_filter: ProcurementStatus = Query(None),
    priority: ProcurementPriority = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(ProcurementRequest)

    # Search
    if search:
        query = query.filter(
            ProcurementRequest.request_title.ilike(f"%{search}%")
        )

    # Department Filter
    if department:
        query = query.filter(
            ProcurementRequest.department_name == department
        )

    # Status Filter
    if status_filter:
        query = query.filter(
            ProcurementRequest.request_status == status_filter
        )

    # Priority Filter
    if priority:
        query = query.filter(
            ProcurementRequest.priority == priority
        )

    # Sorting
    sort_column = getattr(
        ProcurementRequest,
        sort_by,
        ProcurementRequest.created_at
    )

    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()

    requests = (
        query.offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "size": size,
        "total_pages": ceil(total / size) if total else 1,
        "items": requests
    }
@router.get(
    "/dashboard",
    response_model=ProcurementDashboardResponse
)
def procurement_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    total_requests = db.query(ProcurementRequest).count()
    draft_requests = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.DRAFT
    ).count()
    pending_requests = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.PENDING
    ).count()
    approved_requests = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.APPROVED
    ).count()
    rejected_requests = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.REJECTED
    ).count()
    completed_requests = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.COMPLETED
    ).count()
    cancelled_requests = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.CANCELLED
    ).count()

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
        "total_estimated_budget": float(total_estimated_budget),
        "average_estimated_budget": float(average_estimated_budget)
    }
@router.get(
    "/status-dashboard",
    response_model=ProcurementStatusDashboard
)
def procurement_status_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_requests = db.query(ProcurementRequest).count()

    pending = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.PENDING
    ).count()

    approved = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.APPROVED
    ).count()

    rejected = db.query(ProcurementRequest).filter(
        ProcurementRequest.request_status == ProcurementStatus.REJECTED
    ).count()

    vendor_assigned = db.query(ProcurementRequest).filter(
        ProcurementRequest.vendor_id.isnot(None)
    ).count()

    purchase_order_created = db.query(PurchaseOrder).count()

    return ProcurementStatusDashboard(
        total_requests=total_requests,
        pending=pending,
        approved=approved,
        rejected=rejected,
        vendor_assigned=vendor_assigned,
        purchase_order_created=purchase_order_created
    )
@router.get(
    "/status",
    response_model=list[ProcurementStatusResponse]
)
def get_procurement_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    procurements = db.query(ProcurementRequest).all()

    response = []

    for procurement in procurements:

        vendor = None
        if procurement.vendor_id:
            vendor = db.query(Vendor).filter(
                Vendor.id == procurement.vendor_id
            ).first()

        purchase_order = db.query(PurchaseOrder).filter(
            PurchaseOrder.procurement_request_id == procurement.id
        ).first()

        if purchase_order:
            workflow_stage = "Purchase Order Created"
        elif procurement.vendor_id:
            workflow_stage = "Vendor Assigned"
        else:
            workflow_stage = procurement.request_status.value

        response.append(
            ProcurementStatusResponse(
                procurement_request_id=procurement.id,
                procurement_request_number=procurement.request_number,
                item_name=procurement.item_name,
                vendor_name=vendor.company_name if vendor else None,
                request_status=procurement.request_status.value,
                workflow_stage=workflow_stage
            )
        )

    return response
@router.get(
    "/approved-vendors",
    response_model=list[ApprovedVendorResponse]
)
def get_approved_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendors = db.query(Vendor).filter(
        Vendor.approval_status == VendorApprovalStatus.APPROVED,
        Vendor.vendor_status == VendorStatus.ACTIVE
    ).all()

    return [
        ApprovedVendorResponse(
            id=vendor.id,
            vendor_id=vendor.vendor_id,
            company_name=vendor.company_name,
            vendor_category=vendor.vendor_category.value,
            contact_person=vendor.contact_person,
            designation=vendor.designation,
            email=vendor.email,
            phone=vendor.phone,
            vendor_status=vendor.vendor_status.value
        )
        for vendor in vendors
    ]
@router.get(
    "/{procurement_id}",
    response_model=ProcurementRequestResponse
)
def get_procurement_request(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found"
        )

    return procurement

@router.put(
    "/{procurement_id}",
    response_model=ProcurementRequestResponse
)
def update_procurement_request(
    procurement_id: int,
    request: ProcurementRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found"
        )

    if procurement.approval_status == ApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Approved procurement requests cannot be edited."
        )

    if (
        request.required_delivery_date
        and request.required_delivery_date < datetime.today().date()
    ):
        raise HTTPException(
            status_code=400,
            detail="Required delivery date cannot be in the past."
        )

    update_data = request.model_dump(
    exclude_unset=True,
    exclude_none=True
    )

    for key, value in update_data.items():
        setattr(procurement, key, value)

    db.commit()
    db.refresh(procurement)

    return procurement
@router.delete("/{procurement_id}")
def delete_procurement_request(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found"
        )

    if procurement.request_status not in [
    ProcurementStatus.DRAFT,
    ProcurementStatus.PENDING
    ]:
        raise HTTPException(
            status_code=400,
            detail="Only Draft or Pending requests can be deleted."
        )

    db.delete(procurement)
    db.commit()

    return {
        "message": "Procurement request deleted successfully."
    }
@router.put(
    "/{request_id}/approve",
    response_model=ProcurementApprovalResponse
)
def approve_procurement_request(
    request_id: int,
    approval: ProcurementApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    procurement = (
        db.query(ProcurementRequest)
        .filter(ProcurementRequest.id == request_id)
        .first()
    )

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found."
        )

    if procurement.request_status == ProcurementStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Request is already approved."
        )

    if procurement.request_status == ProcurementStatus.REJECTED:
        raise HTTPException(
            status_code=400,
            detail="Rejected requests cannot be approved."
        )

    procurement.request_status = ProcurementStatus.APPROVED
    procurement.approval_status = ApprovalStatus.APPROVED
    procurement.approval_remarks = approval.remarks
    procurement.approved_by = current_user.id
    procurement.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(procurement)

    return ProcurementApprovalResponse(
        message="Procurement request approved successfully.",
        request_id=procurement.id,
        request_status=procurement.request_status,
        approval_status=procurement.approval_status,
        approval_remarks=procurement.approval_remarks,
        approved_by=procurement.approved_by,
        approved_at=procurement.approved_at
    )
@router.put(
    "/{request_id}/reject",
    response_model=ProcurementApprovalResponse,
    summary="Reject Procurement Request"
)
def reject_procurement_request(
    request_id: int,
    rejection: ProcurementRejectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    procurement = (
        db.query(ProcurementRequest)
        .filter(ProcurementRequest.id == request_id)
        .first()
    )

    if not procurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement request not found."
        )

    if procurement.approval_status == ApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approved request cannot be rejected."
        )

    if procurement.approval_status == ApprovalStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is already rejected."
        )

    procurement.request_status = ProcurementStatus.REJECTED
    procurement.approval_status = ApprovalStatus.REJECTED
    procurement.approval_remarks = rejection.remarks
    procurement.approved_by = current_user.id
    procurement.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(procurement)

    return ProcurementApprovalResponse(
        message="Procurement request rejected successfully.",
        request_id=procurement.id,
        request_status=procurement.request_status,
        approval_status=procurement.approval_status,
        approval_remarks=procurement.approval_remarks,
        approved_by=procurement.approved_by,
        approved_at=procurement.approved_at
    )
@router.put(
    "/{request_id}/send-back",
    response_model=ProcurementApprovalResponse,
    summary="Send Back Procurement Request"
)
def send_back_procurement_request(
    request_id: int,
    send_back: ProcurementSendBackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    procurement = (
        db.query(ProcurementRequest)
        .filter(ProcurementRequest.id == request_id)
        .first()
    )

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found."
        )

    if procurement.approval_status == ApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Approved request cannot be sent back."
        )

    procurement.request_status = ProcurementStatus.PENDING
    procurement.approval_status = ApprovalStatus.PENDING
    procurement.approval_remarks = send_back.remarks
    procurement.approved_by = current_user.id
    procurement.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(procurement)

    return ProcurementApprovalResponse(
        message="Procurement request sent back successfully.",
        request_id=procurement.id,
        request_status=procurement.request_status,
        approval_status=procurement.approval_status,
        approval_remarks=procurement.approval_remarks,
        approved_by=procurement.approved_by,
        approved_at=procurement.approved_at
    )
@router.put(
    "/{request_id}/assign-vendor",
    response_model=VendorAssignmentResponse
)
def assign_vendor(
    request_id: int,
    assignment: VendorAssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find procurement request
    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.id == request_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found."
        )

    # Procurement must be approved
    if procurement.request_status != ProcurementStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Procurement request must be approved before assigning a vendor."
        )

    # Prevent reassignment
    if procurement.vendor_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Vendor is already assigned to this procurement request."
        )

    # Find vendor
    vendor = db.query(Vendor).filter(
        Vendor.id == assignment.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found."
        )
    # Vendor must be approved
    if vendor.approval_status != VendorApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Vendor is not approved."
        )

    # Vendor must be active
    if vendor.vendor_status != VendorStatus.ACTIVE:
        raise HTTPException(
            status_code=400,
            detail="Vendor is not active."
        )

    # Assign vendor
    procurement.vendor_id = vendor.id

    db.commit()
    db.refresh(procurement)

    return VendorAssignmentResponse(
        message="Vendor assigned successfully.",
        request_id=procurement.id,
        vendor_id=vendor.id,
        company_name=vendor.company_name
    )
@router.get(
    "/{request_id}/assigned-vendor",
    response_model=AssignedVendorResponse
)
def get_assigned_vendor(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find procurement request
    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.id == request_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found."
        )

    # Check if vendor is assigned
    if procurement.vendor_id is None:
        raise HTTPException(
            status_code=404,
            detail="No vendor assigned to this procurement request."
        )

    # Fetch assigned vendor
    vendor = db.query(Vendor).filter(
        Vendor.id == procurement.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Assigned vendor not found."
        )

    return AssignedVendorResponse(
        request_id=procurement.id,
        request_number=procurement.request_number,
        vendor_id=vendor.id,
        vendor_code=vendor.vendor_id,
        company_name=vendor.company_name,
        vendor_status=vendor.vendor_status.value,
        approval_status=vendor.approval_status.value
    )
