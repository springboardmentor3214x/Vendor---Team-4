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

from app.models.product_quality import (
    ProductQualityEvaluation,
    QualityRating
)

from app.schemas.product_quality import (
    ProductQualityCreate,
    ProductQualityResponse
)

router = APIRouter(
    prefix="/product-quality",
    tags=["Product Quality"]
)

@router.get("", response_model=list[ProductQualityResponse])
def get_product_quality(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ProductQualityEvaluation).order_by(ProductQualityEvaluation.id.desc()).all()
@router.post("", response_model=ProductQualityResponse)
def record_product_quality(
    quality: ProductQualityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == quality.purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    if purchase_order.status != PurchaseOrderStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Quality evaluation can only be submitted for completed purchase orders."
        )

    existing = db.query(ProductQualityEvaluation).filter(
        ProductQualityEvaluation.purchase_order_id == quality.purchase_order_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Quality evaluation already exists."
        )

    average = (
        quality.material_quality +
        quality.packaging_quality +
        quality.quantity_accuracy +
        quality.specification_compliance +
        (5 - quality.product_defects)
    ) / 5

    if average >= 4.5:
        rating = QualityRating.EXCELLENT
    elif average >= 3.5:
        rating = QualityRating.GOOD
    elif average >= 2.5:
        rating = QualityRating.AVERAGE
    else:
        rating = QualityRating.POOR

    evaluation = ProductQualityEvaluation(
        purchase_order_id=purchase_order.id,
        vendor_id=purchase_order.vendor_id,
        inspection_date=quality.inspection_date,
        material_quality=quality.material_quality,
        packaging_quality=quality.packaging_quality,
        quantity_accuracy=quality.quantity_accuracy,
        specification_compliance=quality.specification_compliance,
        product_defects=quality.product_defects,
        overall_quality_rating=rating,
        inspector_remarks=quality.inspector_remarks
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    VendorPerformanceService.update_vendor_performance(
        db,
        evaluation.vendor_id
    )
    return evaluation