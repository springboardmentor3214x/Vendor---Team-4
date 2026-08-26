from datetime import date, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.vendor import Vendor

from app.services.contract_service import get_expiring_contracts
from app.services.certification_service import get_expiring_certifications
from app.services.vendor_document_service import get_expiring_documents

from app.services.sms_service import SMSService
from app.services.email_service import send_email
from app.models.user import User
from app.models.notification import DeliveryMethod

from app.schemas.notification import (
    NotificationResponse,
    NotificationSummary
)
from app.models.notification import (
    Notification,
    NotificationPriority,
    NotificationType
)
from app.schemas.notification import (
    NotificationCreate,
    NotificationRead
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

def create_notification(
    db: Session,
    data: NotificationCreate
):
    notification = Notification(
        user_id=data.user_id,
        notification_type=data.notification_type,
        title=data.title,
        description=data.description,
        related_module=data.related_module,
        related_record_id=data.related_record_id,
        priority=data.priority,
        delivery_method=data.delivery_method
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    # ---------------------------------------------------
    # EMAIL NOTIFICATION
    # ---------------------------------------------------

    if notification.delivery_method == DeliveryMethod.EMAIL:

        user = db.query(User).filter(
            User.id == notification.user_id
        ).first()

        if user and user.email:
            send_email(
                to_email=user.email,
                subject=notification.title,
                body=notification.description
            )


    # ---------------------------------------------------
    # SMS NOTIFICATION
    # ---------------------------------------------------

    elif notification.delivery_method == DeliveryMethod.SMS:

        user = db.query(User).filter(
            User.id == notification.user_id
        ).first()

        if user and user.mobile_number:

            SMSService.send_sms(
                to_number=user.mobile_number,
                message=(
                    f"{notification.title}\n"
                    f"{notification.description}"
                )
            )

    return notification

def get_all_notifications(
    db: Session,
    user_id: int,
    module: str = None,
    priority: str = None,
    is_read: bool = None,
    notification_date: date = None,
    notification_type: str = None
):
    query = db.query(
        Notification
    ).filter(
        Notification.user_id == user_id
    )

    # Module filter - case insensitive
    if module:
        query = query.filter(
            func.lower(Notification.related_module) == module.lower()
        )

    # Priority filter - case insensitive
    if priority:
        priority_value = priority.upper()

        try:
            priority_enum = NotificationPriority(priority_value)
        except ValueError:
            return []

        query = query.filter(
            Notification.priority == priority_enum
        )

    # Read / unread filter
    if is_read is not None:
        query = query.filter(
            Notification.is_read == is_read
        )

    # Date filter
    if notification_date:
        query = query.filter(
            Notification.created_at >= notification_date,
            Notification.created_at < notification_date + timedelta(days=1)
        )

    # Notification type filter - case insensitive
    if notification_type:
        type_value = notification_type.upper()

        try:
            type_enum = NotificationType(type_value)
        except ValueError:
            return []

        query = query.filter(
            Notification.notification_type == type_enum
        )

    return query.order_by(
        Notification.created_at.desc()
    ).all()

def mark_notification_as_read(
    db: Session,
    notification_id: int,
    user_id: int
):
    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()

    if notification is None:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification

def mark_all_notifications_as_read(
    db: Session,
    user_id: int
):
    notifications = db.query(
        Notification
    ).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).all()

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read",
        "count": len(notifications)
    }

def get_unread_notifications(
    db: Session,
    user_id: int
):
    return db.query(
        Notification
    ).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).order_by(
        Notification.created_at.desc()
    ).all()

def get_unread_count(
    db: Session,
    user_id: int
):
    return db.query(
        Notification
    ).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

def mark_notification_as_unread(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notification is None:
        return None
    notification.is_read = False
    db.commit()
    db.refresh(notification)
    return notification
