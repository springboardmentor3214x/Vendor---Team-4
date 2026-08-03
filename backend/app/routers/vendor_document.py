from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

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