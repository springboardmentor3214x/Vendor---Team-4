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

from app.models.service_rating import ServiceRating

from app.schemas.service_rating import (
    ServiceRatingCreate,
    ServiceRatingResponse
)

router = APIRouter(
    prefix="/service-rating",
    tags=["Service Rating"]
)

@router.get("", response_model=list[ServiceRatingResponse])
def get_service_rating(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ServiceRating).order_by(ServiceRating.id.desc()).all()
@router.post("", response_model=ServiceRatingResponse)
def submit_service_rating(
    rating: ServiceRatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == rating.purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    if purchase_order.status != PurchaseOrderStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Service rating can only be submitted for completed purchase orders."
        )

    existing = db.query(ServiceRating).filter(
        ServiceRating.purchase_order_id == rating.purchase_order_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Service rating already submitted."
        )

    overall = round((
        rating.professionalism +
        rating.customer_support +
        rating.documentation_quality +
        rating.flexibility +
        rating.communication_effectiveness +
        rating.issue_resolution
    ) / 6)

    new_rating = ServiceRating(
        purchase_order_id=purchase_order.id,
        vendor_id=purchase_order.vendor_id,
        professionalism=rating.professionalism,
        customer_support=rating.customer_support,
        documentation_quality=rating.documentation_quality,
        flexibility=rating.flexibility,
        communication_effectiveness=rating.communication_effectiveness,
        issue_resolution=rating.issue_resolution,
        overall_service_rating=overall,
        comments=rating.comments
    )

    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    VendorPerformanceService.update_vendor_performance(
        db,
        new_rating.vendor_id
    )
    return new_rating