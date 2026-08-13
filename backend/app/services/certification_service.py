from datetime import date

from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.certification import (
    Certification,
    CertificationStatus
)

from app.schemas.certification import (
    CertificationCreate,
    CertificationUpdate
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
# Create Certification
# ---------------------------------------------------

def create_certification(
    db: Session,
    certification: CertificationCreate
):

    vendor = (
        db.query(Vendor)
        .filter(
            Vendor.id == certification.vendor_id
        )
        .first()
    )

    if not vendor:

        raise ValueError("Vendor not found")

    db_certification = Certification(
        **certification.model_dump()
    )

    db.add(db_certification)

    db.commit()

    db.refresh(db_certification)

    return db_certification


# ---------------------------------------------------
# Get All Certifications
# ---------------------------------------------------

def get_certifications(db: Session):

    return db.query(Certification).all()


# ---------------------------------------------------
# Get Certification By ID
# ---------------------------------------------------

def get_certification(
    db: Session,
    certification_id: int
):

    return (
        db.query(Certification)
        .filter(
            Certification.id == certification_id
        )
        .first()
    )


# ---------------------------------------------------
# Update Certification
# ---------------------------------------------------

def update_certification(
    db: Session,
    certification_id: int,
    certification: CertificationUpdate
):

    db_certification = get_certification(
        db,
        certification_id
    )

    if not db_certification:

        return None

    update_data = certification.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            db_certification,
            key,
            value
        )

    db.commit()

    db.refresh(db_certification)

    return db_certification


# ---------------------------------------------------
# Delete Certification
# ---------------------------------------------------

def delete_certification(
    db: Session,
    certification_id: int
):

    certification = get_certification(
        db,
        certification_id
    )

    if not certification:

        return None

    db.delete(certification)

    db.commit()

    return True


# ---------------------------------------------------
# Vendor Certifications
# ---------------------------------------------------

def get_vendor_certifications(
    db: Session,
    vendor_id: int
):

    return (
        db.query(Certification)
        .filter(
            Certification.vendor_id == vendor_id
        )
        .all()
    )


# ---------------------------------------------------
# Expiring Certifications
# ---------------------------------------------------

def get_expiring_certifications(
    db: Session,
    days: int = 30
):
    today = date.today()

    certifications = db.query(
        Certification
    ).all()

    expiring = []

    for certification in certifications:

        remaining = (
            certification.expiry_date - today
        ).days

        if 0 <= remaining <= days:

            # Find the vendor
            vendor = db.query(Vendor).filter(
                Vendor.id == certification.vendor_id
            ).first()

            if vendor is None:
                continue

            # Check whether notification already exists
            existing = db.query(Notification).filter(
                Notification.user_id == vendor.created_by,
                Notification.notification_type == NotificationType.COMPLIANCE,
                Notification.related_record_id == certification.id,
                Notification.title == "Certification Expiring Soon"
            ).first()

            if existing is None:

                description = (
                    f"Certification "
                    f"{certification.certification_name} "
                    f"will expire in {remaining} day(s)."
                )

                # Create in-app notification
                notification = Notification(
                    user_id=vendor.created_by,
                    notification_type=NotificationType.COMPLIANCE,
                    title="Certification Expiring Soon",
                    description=description,
                    related_module="Certification",
                    related_record_id=certification.id,
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
                        subject="Certification Expiring Soon",
                        body=description
                    )

            expiring.append(certification)

    db.commit()

    return expiring


# ---------------------------------------------------
# Expired Certifications
# ---------------------------------------------------

def get_expired_certifications(
    db: Session
):

    today = date.today()

    return (
        db.query(Certification)
        .filter(
            Certification.expiry_date < today
        )
        .all()
    )


# ---------------------------------------------------
# Update Certification Status
# ---------------------------------------------------

def update_certification_status(
    db: Session,
    certification_id: int,
    status: CertificationStatus
):

    certification = get_certification(
        db,
        certification_id
    )

    if not certification:

        return None

    certification.status = status

    db.commit()

    db.refresh(certification)

    return certification