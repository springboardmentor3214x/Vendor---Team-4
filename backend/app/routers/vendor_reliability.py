from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db

from app.models.user import User
from app.models.vendor import Vendor
from app.models.vendor_reliability import VendorReliability

from app.services.vendor_reliability_service import VendorReliabilityService

from app.schemas.vendor_reliability import (
    VendorReliabilityHistoryResponse,
    VendorReliabilityResponse,
    VendorReliabilityDashboard,
    VendorReliabilityRanking,
    VendorTrendResponse,
    ProcurementRecommendationResponse
)

router = APIRouter(
    prefix="/vendor-reliability",
    tags=["Vendor Reliability"]
)


# ---------------- Dashboard ---------------- #

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return VendorReliabilityService.get_dashboard(db)


# ---------------- Rankings ---------------- #

@router.get(
    "/rankings",
    response_model=list[VendorReliabilityRanking]
)
def rankings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return VendorReliabilityService.get_rankings(db)


# ---------------- history ---------------- #

@router.get(
    "/history/{vendor_id}",
    response_model=list[VendorReliabilityHistoryResponse]
)
def vendor_history(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return VendorReliabilityService.get_vendor_history(
        db,
        vendor_id
    )

# ---------------- Trend ---------------- #

@router.get(
    "/trend/{vendor_id}",
    response_model=VendorTrendResponse
)
def get_vendor_trend(
    vendor_id: int,
    db: Session = Depends(get_db)
):
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found."
        )

    reliability = db.query(VendorReliability).filter(
        VendorReliability.vendor_id == vendor_id
    ).first()

    if not reliability:
        raise HTTPException(
            status_code=404,
            detail="Reliability data not found."
        )

    if reliability.reliability_score >= 90:
        trend = "Excellent Performance"
    elif reliability.reliability_score >= 70:
        trend = "Stable Performance"
    else:
        trend = "Needs Improvement"

    return VendorTrendResponse(
        vendor_id=vendor.id,
        vendor_name=vendor.company_name,
        reliability_score=reliability.reliability_score,
        trend=trend
    )


# ---------------- Recommendation ---------------- #

@router.get(
    "/recommendation/{vendor_id}",
    response_model=ProcurementRecommendationResponse
)
def get_procurement_recommendation(
    vendor_id: int,
    db: Session = Depends(get_db)
):
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found."
        )

    reliability = db.query(VendorReliability).filter(
        VendorReliability.vendor_id == vendor_id
    ).first()

    if not reliability:
        raise HTTPException(
            status_code=404,
            detail="Reliability data not found."
        )

    return ProcurementRecommendationResponse(
        vendor_id=vendor.id,
        vendor_name=vendor.company_name,
        reliability_score=reliability.reliability_score,
        recommendation=reliability.recommendation
    )


# ---------------- Get Vendor Reliability ---------------- #

@router.get(
    "/{vendor_id}",
    response_model=VendorReliabilityResponse
)
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    reliability = VendorReliabilityService.get_vendor_reliability(
        db,
        vendor_id
    )

    if not reliability:
        raise HTTPException(
            status_code=404,
            detail="Vendor reliability not found."
        )

    return reliability