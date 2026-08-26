from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.services.vendor_performance_service import VendorPerformanceService
from app.models.user import User
from app.models.purchase_order import (
    PurchaseOrder,
    PurchaseOrderStatus
)
from app.models.delivery_performance import (
    DeliveryPerformance,
    DeliveryStatus
)

from app.schemas.delivery_performance import (
    DeliveryPerformanceCreate,
    DeliveryPerformanceResponse,
    DeliveryPerformanceDashboard
)

router = APIRouter(
    prefix="/delivery-performance",
    tags=["Delivery Performance"]
)

@router.get("", response_model=list[DeliveryPerformanceResponse])
def get_delivery_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(DeliveryPerformance).order_by(DeliveryPerformance.id.desc()).all()
@router.post("", response_model=DeliveryPerformanceResponse)
def record_delivery(
    delivery: DeliveryPerformanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == delivery.purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    if purchase_order.status != PurchaseOrderStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Delivery can only be recorded for completed purchase orders."
        )

    existing = db.query(DeliveryPerformance).filter(
        DeliveryPerformance.purchase_order_id == delivery.purchase_order_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Delivery already recorded."
        )

    expected_date = purchase_order.expected_delivery_date
    actual_date = delivery.actual_delivery_date

    delay_days = (actual_date - expected_date).days

    if delay_days < 0:
        status = DeliveryStatus.EARLY
        delay_days = 0
    elif delay_days == 0:
        status = DeliveryStatus.ON_TIME
    else:
        status = DeliveryStatus.DELAYED

    new_delivery = DeliveryPerformance(
        purchase_order_id=purchase_order.id,
        vendor_id=purchase_order.vendor_id,
        expected_delivery_date=expected_date,
        actual_delivery_date=actual_date,
        delay_days=delay_days,
        delivery_status=status,
        remarks=delivery.remarks
    )

    db.add(new_delivery)
    db.commit()
    db.refresh(new_delivery)
    VendorPerformanceService.update_vendor_performance(
        db,
        new_delivery.vendor_id
    )
    return new_delivery