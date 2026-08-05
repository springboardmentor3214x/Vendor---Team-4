from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.notification import (
    NotificationResponse,
    NotificationSummary
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