from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.purchase_order import (
    PurchaseOrder,
    PurchaseOrderStatus
)

from app.models.communication_log import (
    CommunicationLog,
    CommunicationStatus
)

from app.schemas.communication_log import (
    CommunicationLogCreate,
    CommunicationLogResponse
)

router = APIRouter(
    prefix="/communication-log",
    tags=["Communication Tracking"]
)
@router.post("", response_model=CommunicationLogResponse)
def record_communication(
    communication: CommunicationLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == communication.purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    if purchase_order.status != PurchaseOrderStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Communication can only be recorded for completed purchase orders."
        )

    response_duration = int(
        (
            communication.vendor_response_time -
            communication.message_sent_time
        ).total_seconds() / 60
    )

    if response_duration < 0:
        raise HTTPException(
            status_code=400,
            detail="Vendor response time cannot be earlier than message sent time."
        )

    status = CommunicationStatus.RESPONDED

    new_log = CommunicationLog(
        purchase_order_id=purchase_order.id,
        vendor_id=purchase_order.vendor_id,
        message_sent_time=communication.message_sent_time,
        vendor_response_time=communication.vendor_response_time,
        response_duration=response_duration,
        communication_status=status,
        remarks=communication.remarks
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log