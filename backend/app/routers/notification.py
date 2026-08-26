from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models.user import User
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db

from app.schemas.notification import (
    NotificationResponse,
    NotificationSummary,
    NotificationCreate,
    NotificationRead
)

from app.services import notification_service

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ---------------------------------------------------
# Get All Notifications
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[NotificationResponse]
)
def get_notifications(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return notification_service.get_notifications(
        db,
        days
    )


# ---------------------------------------------------
# Contract Notifications
# ---------------------------------------------------

@router.get("/contracts")
def get_contract_notifications(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return notification_service.get_contract_notifications(
        db,
        days
    )


# ---------------------------------------------------
# Certification Notifications
# ---------------------------------------------------

@router.get("/certifications")
def get_certification_notifications(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return notification_service.get_certification_notifications(
        db,
        days
    )


# ---------------------------------------------------
# Document Notifications
# ---------------------------------------------------

@router.get("/documents")
def get_document_notifications(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return notification_service.get_document_notifications(
        db,
        days
    )


# ---------------------------------------------------
# Notification Summary
# ---------------------------------------------------

@router.get(
    "/summary",
    response_model=NotificationSummary
)
def get_summary(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return notification_service.get_summary(
        db,
        days
    )

# ---------------------------------------------------
# Create Notification
# ---------------------------------------------------

@router.post(
    "/",
    response_model=NotificationRead
)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db)
):

    return notification_service.create_notification(
        db,
        data
    )

# ---------------------------------------------------
# Get Stored Notifications
# ---------------------------------------------------

@router.get(
    "/stored",
    response_model=list[NotificationRead]
)
def get_all_notifications(
    module: str = None,
    priority: str = None,
    is_read: bool = None,
    notification_date: date = None,
    notification_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return notification_service.get_all_notifications(
        db,
        current_user.id,
        module,
        priority,
        is_read,
        notification_date,
        notification_type
    )

# ---------------------------------------------------
# Get Unread Notifications
# ---------------------------------------------------

@router.get(
    "/unread",
    response_model=list[NotificationRead]
)
def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return notification_service.get_unread_notifications(
        db,
        current_user.id
    )

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "count": notification_service.get_unread_count(
            db,
            current_user.id
        )
    }

# ---------------------------------------------------
# Mark Notification As Read
# ---------------------------------------------------

@router.put("/{notification_id}/unread", response_model=NotificationRead)
def mark_notification_as_unread(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = notification_service.mark_notification_as_unread(
        db, notification_id, current_user.id
    )
    if notification is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.put("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return notification_service.mark_all_notifications_as_read(
        db,
        current_user.id
    )

@router.put(
    "/{notification_id}/read",
    response_model=NotificationRead
)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = notification_service.mark_notification_as_read(
        db,
        notification_id,
        current_user.id
    )

    if notification is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification