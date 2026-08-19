from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    ForeignKey,
    Enum as SqlEnum
)

from sqlalchemy.orm import relationship

from app.database import Base


class DeliveryStatus(str, Enum):
    EARLY = "EARLY"
    ON_TIME = "ON_TIME"
    DELAYED = "DELAYED"


class DeliveryPerformance(Base):
    __tablename__ = "delivery_performance"

    id = Column(Integer, primary_key=True, index=True)

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        nullable=False,
        unique=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    expected_delivery_date = Column(Date, nullable=False)

    actual_delivery_date = Column(Date, nullable=False)

    delay_days = Column(Integer, default=0)

    delivery_status = Column(
        SqlEnum(DeliveryStatus),
        nullable=False
    )

    remarks = Column(String)

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="delivery_performance"
    )

    vendor = relationship(
        "Vendor",
        back_populates="delivery_performances"
    )