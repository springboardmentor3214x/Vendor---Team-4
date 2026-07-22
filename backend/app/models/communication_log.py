from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum as SqlEnum
)

from sqlalchemy.orm import relationship

from app.database import Base


class CommunicationStatus(str, Enum):
    RESPONDED = "RESPONDED"
    NO_RESPONSE = "NO_RESPONSE"


class CommunicationLog(Base):
    __tablename__ = "communication_logs"

    id = Column(Integer, primary_key=True, index=True)

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        nullable=False
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    message_sent_time = Column(
        DateTime,
        nullable=False
    )

    vendor_response_time = Column(
        DateTime,
        nullable=False
    )

    response_duration = Column(Integer, nullable=False)

    communication_status = Column(
        SqlEnum(CommunicationStatus),
        nullable=False
    )

    remarks = Column(String)

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="communication_logs"
    )

    vendor = relationship(
        "Vendor",
        back_populates="communication_logs"
    )