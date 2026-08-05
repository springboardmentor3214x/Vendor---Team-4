from datetime import date

from sqlalchemy.orm import Session

from app.models.vendor import Vendor

from app.services.contract_service import get_expiring_contracts
from app.services.certification_service import get_expiring_certifications
from app.services.vendor_document_service import get_expiring_documents

from app.schemas.notification import (
    NotificationResponse,
    NotificationSummary
)


# ---------------------------------------------------
# Get All Notifications
# ---------------------------------------------------

def get_notifications(
    db: Session,
    days: int = 30
):

    notifications = []

    # ---------------- Contracts ----------------

    contracts = get_expiring_contracts(
        db,
        days
    )

    for contract in contracts:

        vendor = db.query(Vendor).filter(
            Vendor.id == contract.vendor_id
        ).first()

        notifications.append(

            NotificationResponse(

                notification_type="Contract",

                vendor_id=contract.vendor_id,

                vendor_name=vendor.company_name,

                item_name=contract.contract_number,

                expiry_date=str(contract.end_date),

                days_remaining=(
                    contract.end_date - date.today()
                ).days

            )

        )

    # ---------------- Certifications ----------------

    certifications = get_expiring_certifications(
        db,
        days
    )

    for certification in certifications:

        vendor = db.query(Vendor).filter(
            Vendor.id == certification.vendor_id
        ).first()

        notifications.append(

            NotificationResponse(

                notification_type="Certification",

                vendor_id=certification.vendor_id,

                vendor_name=vendor.company_name,

                item_name=certification.certification_name,

                expiry_date=str(
                    certification.expiry_date
                ),

                days_remaining=(
                    certification.expiry_date
                    - date.today()
                ).days

            )

        )

    # ---------------- Documents ----------------

    documents = get_expiring_documents(
        db,
        days
    )

    for document in documents:

        vendor = db.query(Vendor).filter(
            Vendor.id == document.vendor_id
        ).first()

        notifications.append(

            NotificationResponse(

                notification_type="Document",

                vendor_id=document.vendor_id,

                vendor_name=vendor.company_name,

                item_name=document.file_name,

                expiry_date=str(
                    document.expiry_date
                ),

                days_remaining=(
                    document.expiry_date
                    - date.today()
                ).days

            )

        )

    return notifications


# ---------------------------------------------------
# Contract Notifications
# ---------------------------------------------------

def get_contract_notifications(
    db: Session,
    days: int = 30
):

    return get_expiring_contracts(
        db,
        days
    )


# ---------------------------------------------------
# Certification Notifications
# ---------------------------------------------------

def get_certification_notifications(
    db: Session,
    days: int = 30
):

    return get_expiring_certifications(
        db,
        days
    )


# ---------------------------------------------------
# Document Notifications
# ---------------------------------------------------

def get_document_notifications(
    db: Session,
    days: int = 30
):

    return get_expiring_documents(
        db,
        days
    )


# ---------------------------------------------------
# Notification Summary
# ---------------------------------------------------

def get_summary(
    db: Session,
    days: int = 30
):

    contracts = get_expiring_contracts(
        db,
        days
    )

    certifications = get_expiring_certifications(
        db,
        days
    )

    documents = get_expiring_documents(
        db,
        days
    )

    return NotificationSummary(

        total_notifications=(
            len(contracts)
            + len(certifications)
            + len(documents)
        ),

        contract_notifications=len(
            contracts
        ),

        certification_notifications=len(
            certifications
        ),

        document_notifications=len(
            documents
        )

    )