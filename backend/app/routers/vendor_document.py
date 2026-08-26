from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4

from app.database import get_db
from app.auth import get_current_user

from app.models.vendor_document import DocumentStatus

from app.schemas.vendor_document import (
    VendorDocumentCreate,
    VendorDocumentUpdate,
    VendorDocumentResponse
)

from app.services import vendor_document_service

router = APIRouter(
    prefix="/vendor-documents",
    tags=["Vendor Documents"]
)


# ---------------------------------------------------
# Create Document
# ---------------------------------------------------

@router.post(
    "/",
    response_model=VendorDocumentResponse
)
def create_document(
    document: VendorDocumentCreate,
    db: Session = Depends(get_db)
):

    try:

        return vendor_document_service.create_document(
            db,
            document
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )




@router.post("/upload", response_model=VendorDocumentResponse)
def upload_document(
    vendor_id: int = Form(...),
    document_type: str = Form(...),
    expiry_date: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from datetime import date
    from app.models.vendor import Vendor

    if not db.query(Vendor).filter(Vendor.id == vendor_id).first():
        raise HTTPException(status_code=404, detail="Vendor not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="A file is required")

    upload_dir = Path("uploads") / "vendor_documents"
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"vendor_{vendor_id}_{uuid4().hex}_{Path(file.filename).name}"
    path = upload_dir / filename
    size = 0
    with path.open("wb") as output:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            output.write(chunk)

    parsed_expiry = date.fromisoformat(expiry_date) if expiry_date else None
    document = vendor_document_service.create_document(db, VendorDocumentCreate(
        vendor_id=vendor_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=str(path),
        file_size=size,
        file_type=file.content_type,
        uploaded_by=current_user.id,
        expiry_date=parsed_expiry
    ))
    return document

# ---------------------------------------------------
# Get All Documents
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[VendorDocumentResponse]
)
def get_documents(
    db: Session = Depends(get_db)
):

    return vendor_document_service.get_documents(db)


# ---------------------------------------------------
# Get Document By ID
# ---------------------------------------------------

@router.get(
    "/{document_id}",
    response_model=VendorDocumentResponse
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):

    document = vendor_document_service.get_document(
        db,
        document_id
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document


@router.get("/{document_id}/download")
def download_document(document_id:int, db:Session=Depends(get_db)):
    document=vendor_document_service.get_document(db,document_id)
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    path=Path(document.file_path)
    if not path.exists():
        raise HTTPException(status_code=404,detail="Document file not found")
    return FileResponse(path, filename=document.file_name)


# ---------------------------------------------------
# Update Document
# ---------------------------------------------------

@router.put(
    "/{document_id}",
    response_model=VendorDocumentResponse
)
def update_document(
    document_id: int,
    document: VendorDocumentUpdate,
    db: Session = Depends(get_db)
):

    updated = vendor_document_service.update_document(
        db,
        document_id,
        document
    )

    if not updated:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return updated


# ---------------------------------------------------
# Delete Document
# ---------------------------------------------------

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):

    deleted = vendor_document_service.delete_document(
        db,
        document_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return {
        "message": "Document deleted successfully"
    }


# ---------------------------------------------------
# Vendor Documents
# ---------------------------------------------------

@router.get(
    "/vendor/{vendor_id}",
    response_model=list[VendorDocumentResponse]
)
def get_vendor_documents(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    try:
        return vendor_document_service.get_vendor_documents(
            db,
            vendor_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ---------------------------------------------------
# Expiring Documents
# ---------------------------------------------------

@router.get(
    "/expiring/",
    response_model=list[VendorDocumentResponse]
)
def get_expiring_documents(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return vendor_document_service.get_expiring_documents(
        db,
        days
    )


# ---------------------------------------------------
# Expired Documents
# ---------------------------------------------------

@router.get(
    "/expired/",
    response_model=list[VendorDocumentResponse]
)
def get_expired_documents(
    db: Session = Depends(get_db)
):

    return vendor_document_service.get_expired_documents(db)


@router.get("/{document_id}/download")
def download_document(document_id:int, db:Session=Depends(get_db)):
    document=vendor_document_service.get_document(db,document_id)
    if not document:
        raise HTTPException(status_code=404,detail="Document not found")
    path=Path(document.file_path)
    if not path.exists():
        raise HTTPException(status_code=404,detail="Document file not found")
    return FileResponse(path, filename=document.file_name)


# ---------------------------------------------------
# Update Document Status
# ---------------------------------------------------

@router.patch(
    "/{document_id}/status",
    response_model=VendorDocumentResponse
)
def update_status(
    document_id: int,
    status: DocumentStatus,
    db: Session = Depends(get_db)
):

    document = (
        vendor_document_service.update_document_status(
            db,
            document_id,
            status
        )
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document