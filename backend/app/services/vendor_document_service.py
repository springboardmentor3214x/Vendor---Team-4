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

from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
    DeliveryMethod
)

from app.models.user import User
from app.services.email_service import send_email
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

        # Skip documents without an expiry date
        if document.expiry_date is None:
            continue

        remaining = (
            document.expiry_date - today
        ).days

        if 0 <= remaining <= days:

            # Find the vendor
            vendor = db.query(Vendor).filter(
                Vendor.id == document.vendor_id
            ).first()

            if vendor is None:
                continue

            # Check whether notification already exists
            existing = db.query(Notification).filter(
                Notification.user_id == vendor.created_by,
                Notification.notification_type == NotificationType.COMPLIANCE,
                Notification.related_record_id == document.id,
                Notification.title == "Vendor Document Expiring Soon"
            ).first()

            if existing is None:

                description = (
                    f"Vendor document "
                    f"{document.file_name} "
                    f"will expire in {remaining} day(s)."
                )

                # Create in-app notification
                notification = Notification(
                    user_id=vendor.created_by,
                    notification_type=NotificationType.COMPLIANCE,
                    title="Vendor Document Expiring Soon",
                    description=description,
                    related_module="Vendor Document",
                    related_record_id=document.id,
                    priority=NotificationPriority.HIGH,
                    delivery_method=DeliveryMethod.IN_APP
                )

                db.add(notification)

                # Find the user who created the vendor
                user = db.query(User).filter(
                    User.id == vendor.created_by
                ).first()

                # Send email notification
                if user and user.email:

                    send_email(
                        to_email=user.email,
                        subject="Vendor Document Expiring Soon",
                        body=description
                    )

            expiring.append(document)

    db.commit()

    return expiring

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