from datetime import date

from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.vendor_document import (
    VendorDocument,
    DocumentStatus
)

from app.schemas.vendor_document import (
    VendorDocumentCreate,
    VendorDocumentUpdate
)


# ---------------------------------------------------
# Create Document
# ---------------------------------------------------

def create_document(
    db: Session,
    document: VendorDocumentCreate
):

    vendor = (
        db.query(Vendor)
        .filter(
            Vendor.id == document.vendor_id
        )
        .first()
    )

    if not vendor:

        raise ValueError("Vendor not found")

    db_document = VendorDocument(
        **document.model_dump()
    )

    db.add(db_document)

    db.commit()

    db.refresh(db_document)

    return db_document


# ---------------------------------------------------
# Get All Documents
# ---------------------------------------------------

def get_documents(
    db: Session
):

    return db.query(
        VendorDocument
    ).all()


# ---------------------------------------------------
# Get Document By ID
# ---------------------------------------------------

def get_document(
    db: Session,
    document_id: int
):

    return (
        db.query(VendorDocument)
        .filter(
            VendorDocument.id == document_id
        )
        .first()
    )


# ---------------------------------------------------
# Update Document
# ---------------------------------------------------

def update_document(
    db: Session,
    document_id: int,
    document: VendorDocumentUpdate
):

    db_document = get_document(
        db,
        document_id
    )

    if not db_document:

        return None

    update_data = document.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            db_document,
            key,
            value
        )

    db.commit()

    db.refresh(db_document)

    return db_document


# ---------------------------------------------------
# Delete Document
# ---------------------------------------------------

def delete_document(
    db: Session,
    document_id: int
):

    document = get_document(
        db,
        document_id
    )

    if not document:

        return None

    db.delete(document)

    db.commit()

    return True


# ---------------------------------------------------
# Vendor Documents
# ---------------------------------------------------

def get_vendor_documents(
    db: Session,
    vendor_id: int
):

    vendor = (
        db.query(Vendor)
        .filter(Vendor.id == vendor_id)
        .first()
    )

    if not vendor:
        raise ValueError("Vendor not found")

    return (
        db.query(VendorDocument)
        .filter(VendorDocument.vendor_id == vendor_id)
        .all()
    )


# ---------------------------------------------------
# Expiring Documents
# ---------------------------------------------------

def get_expiring_documents(
    db: Session,
    days: int = 30
):

    today = date.today()

    documents = db.query(
        VendorDocument
    ).all()

    expiring = []

    for document in documents:

        if document.expiry_date is None:
            continue

        remaining = (
            document.expiry_date - today
        ).days

        if 0 <= remaining <= days:

            expiring.append(document)

    return expiring


# ---------------------------------------------------
# Expired Documents
# ---------------------------------------------------

def get_expired_documents(
    db: Session
):

    today = date.today()

    return (
        db.query(VendorDocument)
        .filter(
            VendorDocument.expiry_date < today
        )
        .all()
    )


# ---------------------------------------------------
# Update Document Status
# ---------------------------------------------------

def update_document_status(
    db: Session,
    document_id: int,
    status: DocumentStatus
):

    document = get_document(
        db,
        document_id
    )

    if not document:

        return None

    document.status = status

    db.commit()

    db.refresh(document)

    return document