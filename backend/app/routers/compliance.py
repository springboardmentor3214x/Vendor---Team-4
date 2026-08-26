from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.compliance import (
    ComplianceResponse,
    ComplianceSummary
)

from app.services import compliance_service

router = APIRouter(
    prefix="/compliance",
    tags=["Compliance Monitoring"]
)


# ---------------------------------------------------
# Get Compliance For All Vendors
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[ComplianceResponse]
)
def get_compliance(
    db: Session = Depends(get_db)
):

    return compliance_service.get_compliance(db)


# ---------------------------------------------------
# Get Compliance For One Vendor
# ---------------------------------------------------

@router.get(
    "/vendor/{vendor_id}",
    response_model=ComplianceResponse
)
def get_vendor_compliance(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    compliance = compliance_service.get_vendor_compliance(
        db,
        vendor_id
    )

    if not compliance:

        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    return compliance


# ---------------------------------------------------
# Get Non-Compliant Vendors
# ---------------------------------------------------

@router.get(
    "/non-compliant",
    response_model=list[ComplianceResponse]
)
def get_non_compliant_vendors(
    db: Session = Depends(get_db)
):

    return compliance_service.get_non_compliant_vendors(db)


# ---------------------------------------------------
# Compliance Summary
# ---------------------------------------------------

@router.get(
    "/summary",
    response_model=ComplianceSummary
)
def get_summary(
    db: Session = Depends(get_db)
):

    return compliance_service.get_summary(db)


# ---------------------------------------------------
# Expiring Compliance Items
# ---------------------------------------------------

@router.get("/expiring")
def get_expiring_items(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return {

        "contracts":
            compliance_service.get_expiring_contracts(
                db,
                days
            ),

        "certifications":
            compliance_service.get_expiring_certifications(
                db,
                days
            ),

        "documents":
            compliance_service.get_expiring_documents(
                db,
                days
            )

    }