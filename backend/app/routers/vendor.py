from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.vendor import (
    Vendor,
    VendorStatus,
    ApprovalStatus
)

from app.schemas.vendor import (
    VendorCreate,
    VendorResponse
)

router = APIRouter(
    prefix="/vendors",
    tags=["Vendor Management"]
)


@router.post(
    "/",
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED
)
def create_vendor(
    request: VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # -----------------------------
    # Duplicate Company Name
    # -----------------------------
    if db.query(Vendor).filter(
        Vendor.company_name == request.company_name
    ).first():

        raise HTTPException(
            status_code=400,
            detail="Company name already exists"
        )

    # -----------------------------
    # Duplicate Email
    # -----------------------------
    if db.query(Vendor).filter(
        Vendor.email == request.email
    ).first():

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # -----------------------------
    # Duplicate GST
    # -----------------------------
    if db.query(Vendor).filter(
        Vendor.gst_number == request.gst_number
    ).first():

        raise HTTPException(
            status_code=400,
            detail="GST Number already exists"
        )

    # -----------------------------
    # Duplicate PAN
    # -----------------------------
    if db.query(Vendor).filter(
        Vendor.pan_number == request.pan_number
    ).first():

        raise HTTPException(
            status_code=400,
            detail="PAN Number already exists"
        )

    # -----------------------------
    # Duplicate Registration Number
    # -----------------------------
    if db.query(Vendor).filter(
        Vendor.company_registration_number ==
        request.company_registration_number
    ).first():

        raise HTTPException(
            status_code=400,
            detail="Company Registration Number already exists"
        )

    # -----------------------------
    # Generate Vendor ID
    # -----------------------------
    last_vendor = (
        db.query(Vendor)
        .order_by(Vendor.id.desc())
        .first()
    )

    if last_vendor:
        vendor_number = last_vendor.id + 1
    else:
        vendor_number = 1

    vendor_id = f"VND{vendor_number:06d}"

    # -----------------------------
    # Create Vendor
    # -----------------------------
    vendor = Vendor(

        vendor_id=vendor_id,

        company_name=request.company_name,

        vendor_category=request.vendor_category,

        contact_person=request.contact_person,

        designation=request.designation,

        email=request.email,

        phone=request.phone,

        alternate_phone=request.alternate_phone,

        gst_number=request.gst_number,

        pan_number=request.pan_number,

        company_registration_number=request.company_registration_number,

        address_line1=request.address_line1,

        address_line2=request.address_line2,

        city=request.city,

        state=request.state,

        country=request.country,

        pincode=request.pincode,

        website=request.website,

        description=request.description,

        bank_account_number=request.bank_account_number,

        ifsc_code=request.ifsc_code,

        payment_terms=request.payment_terms,

        vendor_status=VendorStatus.PENDING,

        approval_status=ApprovalStatus.PENDING,

        created_by=current_user.id
    )

    db.add(vendor)

    db.commit()

    db.refresh(vendor)

    return vendor