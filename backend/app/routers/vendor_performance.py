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

from app.models.product_quality import ProductQualityEvaluation
from app.models.communication_log import CommunicationLog
from app.models.service_rating import ServiceRating

from app.schemas.vendor_performance import VendorDashboardResponse, VendorPerformanceHistoryResponse, VendorPerformanceResponse, VendorRankingResponse

router = APIRouter(
    prefix="/vendor-performance",
    tags=["Vendor Performance"]
)
@router.get("/dashboard/summary", response_model=VendorDashboardResponse)
def vendor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendors = db.query(Vendor).all()

    if not vendors:
        return VendorDashboardResponse(
            total_vendors=0,
            average_vendor_score=0,
            best_vendor=None,
            worst_vendor=None
        )

    vendor_scores = []
    total_completed_orders = 0
    delayed_deliveries = 0

    all_delivery_scores = []
    all_quality_scores = []
    all_response_times = []
    for vendor in vendors:

        deliveries = db.query(DeliveryPerformance).filter(
            DeliveryPerformance.vendor_id == vendor.id
        ).all()

        quality = db.query(ProductQualityEvaluation).filter(
            ProductQualityEvaluation.vendor_id == vendor.id
        ).all()

        communication = db.query(CommunicationLog).filter(
            CommunicationLog.vendor_id == vendor.id
        ).all()

        service = db.query(ServiceRating).filter(
            ServiceRating.vendor_id == vendor.id
        ).all()
        total_completed_orders += len(deliveries)

        delayed_deliveries += len(
            [
                d for d in deliveries
                if d.delivery_status == DeliveryStatus.DELAYED
            ]
        )
        on_time = (
            len([
                d for d in deliveries
                if d.delivery_status != DeliveryStatus.DELAYED
            ]) / len(deliveries) * 100
            if deliveries else 0
        )
        all_delivery_scores.append(on_time)

        quality_score = (
            sum(
                (
                    q.material_quality +
                    q.packaging_quality +
                    q.quantity_accuracy +
                    q.specification_compliance +
                    (5 - q.product_defects)
                ) / 5
                for q in quality
            ) / len(quality)
            if quality else 0
        )
        all_quality_scores.append(quality_score)

        response_time = (
            sum(c.response_duration for c in communication)
            / len(communication)
            if communication else 0
        )
        if response_time:
            all_response_times.append(response_time)

        service_rating = (
            sum(s.overall_service_rating for s in service)
            / len(service)
            if service else 0
        )

        overall = round(
            (
                on_time / 20 +
                quality_score +
                service_rating +
                max(0, 5 - (response_time / 60))
            ) / 4,
            2
        )

        vendor_scores.append({
            "name": vendor.company_name,
            "score": overall
        })

    average_score = round(
        sum(v["score"] for v in vendor_scores) / len(vendor_scores),
        2
    )

    best_vendor = max(
        vendor_scores,
        key=lambda x: x["score"]
    )

    worst_vendor = min(
        vendor_scores,
        key=lambda x: x["score"]
    )

    average_delivery = round(
        sum(all_delivery_scores) / len(all_delivery_scores),
        2
    ) if all_delivery_scores else 0

    average_quality = round(
        sum(all_quality_scores) / len(all_quality_scores),
        2
    ) if all_quality_scores else 0

    average_response = round(
        sum(all_response_times) / len(all_response_times),
        2
    ) if all_response_times else 0

    return VendorDashboardResponse(
    total_vendors=len(vendors),

    total_completed_orders=total_completed_orders,
    delayed_deliveries=delayed_deliveries,

    average_delivery_performance=average_delivery,
    average_quality_rating=average_quality,
    average_response_time=average_response,

    average_vendor_score=average_score,

    best_vendor=best_vendor["name"],
    worst_vendor=worst_vendor["name"]
    )
@router.get("/rankings", response_model=list[VendorRankingResponse])
def vendor_rankings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendors = db.query(Vendor).all()

    rankings = []

    for vendor in vendors:

        deliveries = db.query(DeliveryPerformance).filter(
            DeliveryPerformance.vendor_id == vendor.id
        ).all()

        quality = db.query(ProductQualityEvaluation).filter(
            ProductQualityEvaluation.vendor_id == vendor.id
        ).all()

        communications = db.query(CommunicationLog).filter(
            CommunicationLog.vendor_id == vendor.id
        ).all()

        services = db.query(ServiceRating).filter(
            ServiceRating.vendor_id == vendor.id
        ).all()

        on_time = (
            len([
                d for d in deliveries
                if d.delivery_status != DeliveryStatus.DELAYED
            ]) / len(deliveries) * 100
            if deliveries else 0
        )

        quality_score = (
            sum(
                (
                    q.material_quality +
                    q.packaging_quality +
                    q.quantity_accuracy +
                    q.specification_compliance +
                    (5 - q.product_defects)
                ) / 5
                for q in quality
            ) / len(quality)
            if quality else 0
        )

        response_time = (
            sum(c.response_duration for c in communications)
            / len(communications)
            if communications else 0
        )

        service_rating = (
            sum(s.overall_service_rating for s in services)
            / len(services)
            if services else 0
        )

        overall = round(
            (
                on_time / 20 +
                quality_score +
                service_rating +
                max(0, 5 - (response_time / 60))
            ) / 4,
            2
        )

        rankings.append({
            "vendor_id": vendor.id,
            "vendor_name": vendor.company_name,
            "vendor_category": getattr(vendor, "category", None),

            "delivery_score": round(on_time / 20, 2),
            "quality_score": round(quality_score, 2),

            "communication_score": round(
                max(0, 5 - (response_time / 60)),
                2
            ),

            "service_rating": round(service_rating, 2),

            "overall_vendor_score": overall
        })

    rankings.sort(
        key=lambda x: x["overall_vendor_score"],
        reverse=True
    )

    result = []

    for index, vendor in enumerate(rankings, start=1):
        result.append(
            VendorRankingResponse(
                rank=index,

                vendor_id=vendor["vendor_id"],
                vendor_name=vendor["vendor_name"],
                vendor_category=vendor["vendor_category"],

                delivery_score=vendor["delivery_score"],
                quality_score=vendor["quality_score"],
                communication_score=vendor["communication_score"],
                service_rating=vendor["service_rating"],

                overall_vendor_score=vendor["overall_vendor_score"]
            )
        )

    return result
@router.get("/{vendor_id}", response_model=VendorPerformanceResponse)
def get_vendor_performance(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found."
        )

    deliveries = db.query(DeliveryPerformance).filter(
        DeliveryPerformance.vendor_id == vendor_id
    ).all()

    quality = db.query(ProductQualityEvaluation).filter(
        ProductQualityEvaluation.vendor_id == vendor_id
    ).all()

    communications = db.query(CommunicationLog).filter(
        CommunicationLog.vendor_id == vendor_id
    ).all()

    services = db.query(ServiceRating).filter(
        ServiceRating.vendor_id == vendor_id
    ).all()

    delayed_delivery_count = len([
        d for d in deliveries
        if d.delivery_status == DeliveryStatus.DELAYED
    ])
    
    average_delay = (
        sum(d.delay_days for d in deliveries) / len(deliveries)
        if deliveries else 0
    )

    on_time = (
        len([
            d for d in deliveries
            if d.delivery_status != DeliveryStatus.DELAYED
        ]) / len(deliveries) * 100
        if deliveries else 0
    )

    quality_score = (
        sum(
            (
                q.material_quality +
                q.packaging_quality +
                q.quantity_accuracy +
                q.specification_compliance +
                (5 - q.product_defects)
            ) / 5
            for q in quality
        ) / len(quality)
        if quality else 0
    )

    response_time = (
        sum(c.response_duration for c in communications) /
        len(communications)
        if communications else 0
    )

    service_rating = (
        sum(s.overall_service_rating for s in services) /
        len(services)
        if services else 0
    )

    overall_score = round(
        (
            on_time / 20 +
            quality_score +
            service_rating +
            max(0, 5 - (response_time / 60))
        ) / 4,
        2
    )

    completed_orders = len(deliveries)

    total_orders = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor_id
    ).count()

    order_completion_rate = round(
        (completed_orders / total_orders) * 100,
        2
    ) if total_orders else 0

    return VendorPerformanceResponse(
        vendor_id=vendor.id,
        vendor_name=vendor.company_name,

        average_delivery_delay=round(average_delay, 2),
        on_time_delivery_rate=round(on_time, 2),
        delayed_delivery_count=delayed_delivery_count,

        average_quality_score=round(quality_score, 2),

        average_response_time=round(response_time, 2),

        average_service_rating=round(service_rating, 2),

        order_completion_rate=order_completion_rate,

        overall_vendor_score=overall_score
    )
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