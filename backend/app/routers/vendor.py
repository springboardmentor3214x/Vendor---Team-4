import os
from uuid import uuid4
from datetime import datetime
from math import ceil

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    UploadFile,
    File,
    Form
)

from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from typing import Optional
from fastapi import UploadFile, File, Form
from fastapi.responses import FileResponse

from app.database import get_db
from app.auth import get_current_user

from app.models.vendor import (
    Vendor,
    VendorStatus,
    ApprovalStatus
)

from app.models.vendor_document import VendorDocument

from app.schemas.vendor import (
    VendorCreate,
    VendorUpdate,
    VendorResponse,
    VendorListResponse,
    VendorApprovalResponse,
    VendorDashboardResponse,
    VendorDocumentResponse
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
from math import ceil


@router.get(
    "/",
    response_model=VendorListResponse
)
def get_all_vendors(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    approval: Optional[str] = Query(None),

    sort_by: str = Query("company_name"),
    order: str = Query("asc"),

    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    query = db.query(Vendor)

    # -------------------------
    # Search
    # -------------------------
    if search:

        query = query.filter(

            (Vendor.vendor_id.ilike(f"%{search}%")) |

            (Vendor.company_name.ilike(f"%{search}%")) |

            (Vendor.contact_person.ilike(f"%{search}%")) |

            (Vendor.email.ilike(f"%{search}%")) |

            (Vendor.gst_number.ilike(f"%{search}%"))

        )

    # -------------------------
    # Filters
    # -------------------------
    if category:
        query = query.filter(
            Vendor.vendor_category == category
        )

    if status:
        query = query.filter(
            Vendor.vendor_status == status
        )

    if approval:
        query = query.filter(
            Vendor.approval_status == approval
        )

    # -------------------------
    # Sorting
    # -------------------------
    sortable_columns = {

        "company_name": Vendor.company_name,

        "vendor_id": Vendor.vendor_id,

        "created_at": Vendor.created_at

    }

    column = sortable_columns.get(
        sort_by,
        Vendor.company_name
    )

    if order.lower() == "desc":

        query = query.order_by(
            desc(column)
        )

    else:

        query = query.order_by(
            asc(column)
        )

    # -------------------------
    # Total Count
    # -------------------------
    total = query.count()

    # -------------------------
    # Pagination
    # -------------------------
    vendors = (

        query

        .offset((page - 1) * size)

        .limit(size)

        .all()

    )

    return {

        "total": total,

        "page": page,

        "size": size,

        "total_pages": ceil(total / size)
        if total else 1,

        "items": vendors

    }
@router.get(
    "/dashboard",
    response_model=VendorDashboardResponse
)
def vendor_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    total_vendors = db.query(Vendor).count()

    pending_vendors = db.query(Vendor).filter(
        Vendor.approval_status == ApprovalStatus.PENDING
    ).count()

    approved_vendors = db.query(Vendor).filter(
        Vendor.approval_status == ApprovalStatus.APPROVED
    ).count()

    rejected_vendors = db.query(Vendor).filter(
        Vendor.approval_status == ApprovalStatus.REJECTED
    ).count()

    active_vendors = db.query(Vendor).filter(
        Vendor.vendor_status == VendorStatus.ACTIVE
    ).count()

    inactive_vendors = db.query(Vendor).filter(
        Vendor.vendor_status == VendorStatus.INACTIVE
    ).count()

    suspended_vendors = db.query(Vendor).filter(
        Vendor.vendor_status == VendorStatus.SUSPENDED
    ).count()

    return {
        "total_vendors": total_vendors,
        "pending_vendors": pending_vendors,
        "approved_vendors": approved_vendors,
        "rejected_vendors": rejected_vendors,
        "active_vendors": active_vendors,
        "inactive_vendors": inactive_vendors,
        "suspended_vendors": suspended_vendors
    }
@router.get(
    "/{vendor_id}",
    response_model=VendorResponse
)
def get_vendor_by_id(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:

        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    return vendor
@router.put(
    "/{vendor_id}",
    response_model=VendorResponse
)
def update_vendor(
    vendor_id: int,
    request: VendorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    # -------------------------
    # Duplicate Company Name
    # -------------------------
    if request.company_name:

        existing = db.query(Vendor).filter(
            Vendor.company_name == request.company_name,
            Vendor.id != vendor_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Company name already exists"
            )

    # -------------------------
    # Duplicate Email
    # -------------------------
    if request.email:

        existing = db.query(Vendor).filter(
            Vendor.email == request.email,
            Vendor.id != vendor_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    # -------------------------
    # Duplicate GST
    # -------------------------
    if request.gst_number:

        existing = db.query(Vendor).filter(
            Vendor.gst_number == request.gst_number,
            Vendor.id != vendor_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="GST number already exists"
            )

    # -------------------------
    # Duplicate PAN
    # -------------------------
    if request.pan_number:

        existing = db.query(Vendor).filter(
            Vendor.pan_number == request.pan_number,
            Vendor.id != vendor_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="PAN number already exists"
            )

    # -------------------------
    # Duplicate Registration Number
    # -------------------------
    if request.company_registration_number:

        existing = db.query(Vendor).filter(
            Vendor.company_registration_number == request.company_registration_number,
            Vendor.id != vendor_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Company registration number already exists"
            )

    update_data = request.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(vendor, key, value)

    vendor.updated_by = current_user.id

    db.commit()
    db.refresh(vendor)

    return vendor
@router.delete(
    "/{vendor_id}"
)
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:

        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    db.delete(vendor)

    db.commit()

    return {
        "message": "Vendor deleted successfully"
    }
@router.patch(
    "/{vendor_id}/approve",
    response_model=VendorApprovalResponse
)
def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Already approved
    if vendor.approval_status == ApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor is already approved"
        )

    # Cannot approve a rejected vendor
    elif vendor.approval_status == ApprovalStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejected vendor cannot be approved"
        )

    vendor.approval_status = ApprovalStatus.APPROVED
    vendor.vendor_status = VendorStatus.ACTIVE
    vendor.approved_by = current_user.id
    vendor.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(vendor)

    return {
        "message": "Vendor approved successfully",
        "vendor_id": vendor.vendor_id,
        "approval_status": vendor.approval_status.value,
        "vendor_status": vendor.vendor_status.value
    }
@router.patch(
    "/{vendor_id}/reject",
    response_model=VendorApprovalResponse
)
def reject_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Already rejected
    if vendor.approval_status == ApprovalStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor is already rejected"
        )

    # Cannot reject an approved vendor
    elif vendor.approval_status == ApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approved vendor cannot be rejected"
        )

    vendor.approval_status = ApprovalStatus.REJECTED
    vendor.vendor_status = VendorStatus.REJECTED
    vendor.approved_by = current_user.id
    vendor.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(vendor)

    return {
        "message": "Vendor rejected successfully",
        "vendor_id": vendor.vendor_id,
        "approval_status": vendor.approval_status.value,
        "vendor_status": vendor.vendor_status.value
    }
@router.post(
    "/{vendor_id}/documents",
    response_model=VendorDocumentResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_vendor_document(
    vendor_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    # Allowed file types
    allowed_extensions = {
        "pdf",
        "jpg",
        "jpeg",
        "png"
    }

    extension = file.filename.split(".")[-1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG and PNG files are allowed"
        )

    upload_folder = "uploads/vendor_documents"

    os.makedirs(upload_folder, exist_ok=True)

    unique_filename = f"{uuid4()}.{extension}"

    file_path = os.path.join(
        upload_folder,
        unique_filename
    )

    contents = file.file.read()

    # 5 MB limit
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 5 MB"
        )

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    document = VendorDocument(
        vendor_id=vendor.id,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path,
        file_size=len(contents),
        file_type=file.content_type,
        uploaded_by=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "file_name": document.file_name,
        "document_type": document.document_type
    }
@router.get("/{vendor_id}/documents")
def get_vendor_documents(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    documents = db.query(VendorDocument).filter(
        VendorDocument.vendor_id == vendor_id
    ).all()

    return documents
@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    document = db.query(VendorDocument).filter(
        VendorDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.file_type
    )
@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    document = db.query(VendorDocument).filter(
        VendorDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully"
    }