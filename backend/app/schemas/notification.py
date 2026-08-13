from pydantic import BaseModel

from datetime import datetime
from typing import Optional

from app.models.notification import (
    NotificationType,
    NotificationPriority,
    DeliveryMethod
)


class NotificationResponse(BaseModel):

    notification_type: str

    vendor_id: int

    vendor_name: str

    item_name: str

    expiry_date: str

    days_remaining: int


class NotificationSummary(BaseModel):

    total_notifications: int

    contract_notifications: int

    certification_notifications: int

    document_notifications: int

class NotificationCreate(BaseModel):

    user_id: int

    notification_type: NotificationType

    title: str

    description: str

    related_module: Optional[str] = None

    related_record_id: Optional[int] = None

    priority: NotificationPriority = NotificationPriority.MEDIUM

    delivery_method: DeliveryMethod = DeliveryMethod.IN_APP


class NotificationRead(BaseModel):

    id: int

    user_id: int

    notification_type: NotificationType

    title: str

    description: str

    related_module: Optional[str]

    related_record_id: Optional[int]

    priority: NotificationPriority

    delivery_method: DeliveryMethod

    is_read: bool

    created_at: datetime

    class Config:
        from_attributes = True