from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum
)

from sqlalchemy.orm import relationship

from app.database import Base


class DiscussionStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class Discussion(Base):

    __tablename__ = "discussions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    status = Column(
        SQLEnum(DiscussionStatus),
        default=DiscussionStatus.OPEN,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    purchase_order = relationship(
        "PurchaseOrder"
    )

    creator = relationship(
        "User"
    )