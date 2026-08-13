from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.services.vendor_performance_service import VendorPerformanceService
from app.models.user import User
from app.models.vendor import Vendor
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
from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
    DeliveryMethod
)

router = APIRouter(
    prefix="/delivery-performance",
    tags=["Delivery Performance"]
)
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
    # -------------------------------------------------
    # DELIVERY DELAY NOTIFICATION
    # -------------------------------------------------

    if status == DeliveryStatus.DELAYED:

        # Find the vendor
        vendor = db.query(Vendor).filter(
            Vendor.id == purchase_order.vendor_id
        ).first()

        # Find Procurement Managers
        procurement_managers = db.query(User).filter(
            User.role == "Procurement Manager"
        ).all()

        # Find Supply Chain Managers
        supply_chain_managers = db.query(User).filter(
            User.role == "Supply Chain Manager"
        ).all()

        # Collect recipient IDs without duplicates
        recipient_ids = set()

        for user in procurement_managers:
            recipient_ids.add(user.id)

        for user in supply_chain_managers:
            recipient_ids.add(user.id)

        # Include the user who recorded the delivery
        if current_user:
            recipient_ids.add(current_user.id)

        # Include vendor record creator if available
        if vendor and vendor.created_by:
            recipient_ids.add(vendor.created_by)

        # Create notifications
        for user_id in recipient_ids:

            # Prevent duplicate notification
            existing = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.notification_type == NotificationType.DELIVERY,
                Notification.related_module == "Delivery Performance",
                Notification.related_record_id == new_delivery.id
            ).first()

            if existing:
                continue

            notification = Notification(
                user_id=user_id,
                notification_type=NotificationType.DELIVERY,
                title="Delivery Delayed",
                description=(
                    f"Purchase Order {purchase_order.po_number} "
                    f"has been delayed by {delay_days} day(s)."
                ),
                related_module="Delivery Performance",
                related_record_id=new_delivery.id,
                priority=NotificationPriority.HIGH,
                delivery_method=DeliveryMethod.IN_APP,
                is_read=False
            )

            db.add(notification)

        db.commit()
    VendorPerformanceService.update_vendor_performance(
        db,
        new_delivery.vendor_id
    )
    return new_delivery