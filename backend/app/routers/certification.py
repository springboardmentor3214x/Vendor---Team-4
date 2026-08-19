from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.certification import CertificationStatus

from app.schemas.certification import (
    CertificationCreate,
    CertificationUpdate,
    CertificationResponse
)

from app.services import certification_service

router = APIRouter(
    prefix="/certifications",
    tags=["Certifications"]
)


# ---------------------------------------------------
# Create Certification
# ---------------------------------------------------

@router.post(
    "/",
    response_model=CertificationResponse
)
def create_certification(
    certification: CertificationCreate,
    db: Session = Depends(get_db)
):

    try:

        return certification_service.create_certification(
            db,
            certification
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ---------------------------------------------------
# Get All Certifications
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[CertificationResponse]
)
def get_certifications(
    db: Session = Depends(get_db)
):

    return certification_service.get_certifications(db)


# ---------------------------------------------------
# Get Certification By ID
# ---------------------------------------------------

@router.get(
    "/{certification_id}",
    response_model=CertificationResponse
)
def get_certification(
    certification_id: int,
    db: Session = Depends(get_db)
):

    certification = certification_service.get_certification(
        db,
        certification_id
    )

    if not certification:

        raise HTTPException(
            status_code=404,
            detail="Certification not found"
        )

    return certification


# ---------------------------------------------------
# Update Certification
# ---------------------------------------------------

@router.put(
    "/{certification_id}",
    response_model=CertificationResponse
)
def update_certification(
    certification_id: int,
    certification: CertificationUpdate,
    db: Session = Depends(get_db)
):

    updated = certification_service.update_certification(
        db,
        certification_id,
        certification
    )

    if not updated:

        raise HTTPException(
            status_code=404,
            detail="Certification not found"
        )

    return updated


# ---------------------------------------------------
# Delete Certification
# ---------------------------------------------------

@router.delete("/{certification_id}")
def delete_certification(
    certification_id: int,
    db: Session = Depends(get_db)
):

    deleted = certification_service.delete_certification(
        db,
        certification_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Certification not found"
        )

    return {
        "message": "Certification deleted successfully"
    }


# ---------------------------------------------------
# Vendor Certifications
# ---------------------------------------------------

@router.get(
    "/vendor/{vendor_id}",
    response_model=list[CertificationResponse]
)
def get_vendor_certifications(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    return certification_service.get_vendor_certifications(
        db,
        vendor_id
    )


# ---------------------------------------------------
# Expiring Certifications
# ---------------------------------------------------

@router.get(
    "/expiring/",
    response_model=list[CertificationResponse]
)
def get_expiring_certifications(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return certification_service.get_expiring_certifications(
        db,
        days
    )


# ---------------------------------------------------
# Expired Certifications
# ---------------------------------------------------

@router.get(
    "/expired/",
    response_model=list[CertificationResponse]
)
def get_expired_certifications(
    db: Session = Depends(get_db)
):

    return certification_service.get_expired_certifications(db)


# ---------------------------------------------------
# Update Certification Status
# ---------------------------------------------------

@router.patch(
    "/{certification_id}/status",
    response_model=CertificationResponse
)
def update_status(
    certification_id: int,
    status: CertificationStatus,
    db: Session = Depends(get_db)
):

    certification = (
        certification_service.update_certification_status(
            db,
            certification_id,
            status
        )
    )

    if not certification:

        raise HTTPException(
            status_code=404,
            detail="Certification not found"
        )

    return certification