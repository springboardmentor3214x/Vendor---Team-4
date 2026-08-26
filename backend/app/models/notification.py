from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum
)

from sqlalchemy.orm import relationship

from app.database import Base


class NotificationType(str, Enum):
    PROCUREMENT = "PROCUREMENT"
    VENDOR = "VENDOR"
    PURCHASE_ORDER = "PURCHASE_ORDER"
    DELIVERY = "DELIVERY"
    CONTRACT = "CONTRACT"
    COMPLIANCE = "COMPLIANCE"
    MESSAGE = "MESSAGE"
    SYSTEM = "SYSTEM"


class NotificationPriority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class DeliveryMethod(str, Enum):
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"
    SMS = "SMS"


class Notification(Base):

    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    notification_type = Column(
        SQLEnum(NotificationType),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        String(1000),
        nullable=False
    )

    related_module = Column(
        String(100),
        nullable=True
    )

    related_record_id = Column(
        Integer,
        nullable=True
    )

    priority = Column(
        SQLEnum(NotificationPriority),
        default=NotificationPriority.MEDIUM,
        nullable=False
    )

    delivery_method = Column(
        SQLEnum(DeliveryMethod),
        default=DeliveryMethod.IN_APP,
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship("User")
