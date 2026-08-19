from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.purchase_order import (
    PurchaseOrder,
    PurchaseOrderStatus
)

from app.schemas.order_tracking import (
    OrderTrackingUpdate,
    OrderTrackingResponse,
    OrderTrackingDashboard
)

router = APIRouter(
    prefix="/order-tracking",
    tags=["Order Tracking"]
)
@router.get("")
def get_all_order_tracking(
    status: PurchaseOrderStatus | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PurchaseOrder)
    if status:
        query = query.filter(PurchaseOrder.status == status)
    orders = query.order_by(PurchaseOrder.id.desc()).all()
    return [{
        "purchase_order_id": po.id,
        "po_number": po.po_number,
        "vendor_id": po.vendor_id,
        "vendor_name": po.vendor.company_name if po.vendor else None,
        "status": po.status.value,
        "purchase_order_date": po.purchase_order_date,
        "expected_delivery_date": po.expected_delivery_date,
        "total_cost": po.total_cost,
    } for po in orders]

@router.get("/dashboard", response_model=OrderTrackingDashboard)
def tracking_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_orders = db.query(PurchaseOrder).count()

    pending = db.query(PurchaseOrder).filter(
        PurchaseOrder.status == PurchaseOrderStatus.PENDING
    ).count()

    generated = db.query(PurchaseOrder).filter(
        PurchaseOrder.status == PurchaseOrderStatus.GENERATED
    ).count()

    sent = db.query(PurchaseOrder).filter(
        PurchaseOrder.status == PurchaseOrderStatus.SENT
    ).count()

    cancelled = db.query(PurchaseOrder).filter(
        PurchaseOrder.status == PurchaseOrderStatus.CANCELLED
    ).count()

    return OrderTrackingDashboard(
        total_orders=total_orders,
        pending=pending,
        generated=generated,
        sent=sent,
        cancelled=cancelled
    )
@router.patch("/{purchase_order_id}", response_model=OrderTrackingResponse)
def update_tracking_status(
    purchase_order_id: int,
    tracking: OrderTrackingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    current_status = purchase_order.status
    new_status = tracking.status

    valid_transitions = {
    PurchaseOrderStatus.PENDING: [PurchaseOrderStatus.GENERATED],
    PurchaseOrderStatus.GENERATED: [PurchaseOrderStatus.SENT],
    PurchaseOrderStatus.SENT: [PurchaseOrderStatus.COMPLETED],
    PurchaseOrderStatus.COMPLETED: [],
    PurchaseOrderStatus.CANCELLED: []
}

    if new_status not in valid_transitions[current_status]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from {current_status} to {new_status}"
        )

    purchase_order.status = new_status

    db.commit()
    db.refresh(purchase_order)

    return OrderTrackingResponse(
        purchase_order_id=purchase_order.id,
        po_number=purchase_order.po_number,
        vendor_id=purchase_order.vendor_id,
        status=purchase_order.status
    )
@router.get("/{purchase_order_id}", response_model=OrderTrackingResponse)
def get_order_tracking(
    purchase_order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return OrderTrackingResponse(
        purchase_order_id=purchase_order.id,
        po_number=purchase_order.po_number,
        vendor_id=purchase_order.vendor_id,
        status=purchase_order.status
    )