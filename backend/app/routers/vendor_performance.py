from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.vendor import Vendor

from app.models.delivery_performance import (
    DeliveryPerformance,
    DeliveryStatus
)
from app.models.purchase_order import PurchaseOrder
from app.services.vendor_performance_service import VendorPerformanceService

from app.models.product_quality import ProductQualityEvaluation
from app.models.communication_log import CommunicationLog
from app.models.service_rating import ServiceRating

from app.schemas.vendor_performance import VendorDashboardResponse, VendorPerformanceHistoryResponse, VendorPerformanceResponse, VendorRankingResponse

router = APIRouter(
    prefix="/vendor-performance",
    tags=["Vendor Performance"]
)
@router.get(
    "/dashboard/summary",
    response_model=VendorDashboardResponse
)
def vendor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    dashboard = VendorPerformanceService.get_dashboard_summary(db)

    return VendorDashboardResponse(**dashboard)
@router.get("/rankings")
def vendor_rankings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return VendorPerformanceService.get_rankings(db)
@router.get(
    "/history/{vendor_id}",
    response_model=list[VendorPerformanceHistoryResponse]
)
def vendor_history(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found."
        )

    deliveries = db.query(DeliveryPerformance).filter(
        DeliveryPerformance.vendor_id == vendor_id
    ).all()

    history = []

    for delivery in deliveries:

        quality = db.query(ProductQualityEvaluation).filter(
            ProductQualityEvaluation.purchase_order_id ==
            delivery.purchase_order_id
        ).first()

        communication = db.query(CommunicationLog).filter(
            CommunicationLog.purchase_order_id ==
            delivery.purchase_order_id
        ).first()

        service = db.query(ServiceRating).filter(
            ServiceRating.purchase_order_id ==
            delivery.purchase_order_id
        ).first()

        quality_score = 0

        if quality:
            quality_score = (
                quality.material_quality +
                quality.packaging_quality +
                quality.quantity_accuracy +
                quality.specification_compliance +
                (5 - quality.product_defects)
            ) / 5

        response_time = (
            communication.response_duration
            if communication else 0
        )

        service_rating = (
            service.overall_service_rating
            if service else 0
        )

        overall = round(
            (
                (5 if delivery.delay_days <= 0 else max(0, 5 - delivery.delay_days))
                + quality_score
                + service_rating
                + max(0, 5 - (response_time / 60))
            ) / 4,
            2
        )

        history.append(
            VendorPerformanceHistoryResponse(
                purchase_order_id=delivery.purchase_order_id,
                expected_delivery_date=delivery.expected_delivery_date,
                actual_delivery_date=delivery.actual_delivery_date,
                delivery_delay=delivery.delay_days,
                quality_score=round(quality_score, 2),
                response_time=response_time,
                service_rating=service_rating,
                overall_score=overall
            )
        )

    return history
@router.get("/{vendor_id}", response_model=VendorPerformanceResponse)
def get_vendor_performance(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    performance = VendorPerformanceService.get_vendor_performance(
        db,
        vendor_id
    )

    if not performance:
        raise HTTPException(
            status_code=404,
            detail="Vendor performance not found."
        )

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    return VendorPerformanceResponse(
        vendor_id=vendor.id,
        vendor_name=vendor.company_name,
        average_delivery_delay=performance.average_delivery_delay,
        on_time_delivery_rate=performance.on_time_delivery_rate,
        delayed_delivery_count=performance.delayed_delivery_count,
        average_quality_score=performance.average_quality_score,
        average_response_time=performance.average_response_time,
        average_service_rating=performance.average_service_rating,
        order_completion_rate=performance.order_completion_rate,
        overall_vendor_score=performance.overall_vendor_score,
        total_orders=db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).count(),
        completed_orders=db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id, PurchaseOrder.status == "COMPLETED").count()
    )
