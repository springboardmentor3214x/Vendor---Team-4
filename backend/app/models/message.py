from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class Message(Base):

    __tablename__ = "messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        nullable=True
    )

    message = Column(
        Text,
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

    sender = relationship(
        "User",
        foreign_keys=[sender_id]
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id]
    )

    purchase_order = relationship(
        "PurchaseOrder"
    )