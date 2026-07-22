from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Enum as SQLEnum
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# -----------------------------
# Purchase Order Status
# -----------------------------
class PurchaseOrderStatus(str, Enum):
    PENDING = "PENDING"
    GENERATED = "GENERATED"
    SENT = "SENT"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# -----------------------------
# Purchase Order Model
# -----------------------------
class PurchaseOrder(Base):

    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)

    po_number = Column(
        String,
        unique=True,
        nullable=False
    )

    procurement_request_id = Column(
        Integer,
        ForeignKey("procurement_requests.id"),
        nullable=False
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    purchase_order_date = Column(
        Date,
        nullable=False
    )

    expected_delivery_date = Column(
        Date,
        nullable=False
    )

    quantity_ordered = Column(
        Integer,
        nullable=False
    )

    unit_price = Column(
        Float,
        nullable=False
    )

    total_cost = Column(
        Float,
        nullable=False
    )

    tax_details = Column(String)

    shipping_address = Column(String)

    payment_terms = Column(String)

    status = Column(
        SQLEnum(PurchaseOrderStatus),
        default=PurchaseOrderStatus.PENDING,
        nullable=False
    )

    approved_by = Column(Integer)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    procurement_request = relationship(
    "ProcurementRequest",
    back_populates="purchase_orders"
    )

    vendor = relationship(
        "Vendor",
        back_populates="purchase_orders"
    )
    invoices = relationship(
    "Invoice",
    back_populates="purchase_order"
    )
    delivery_performance = relationship(
    "DeliveryPerformance",
    back_populates="purchase_order",
    uselist=False
    )

    product_quality = relationship(
    "ProductQualityEvaluation",
    back_populates="purchase_order",
    uselist=False
    )

    communication_logs = relationship(
    "CommunicationLog",
    back_populates="purchase_order"
    )

    service_rating = relationship(
    "ServiceRating",
    back_populates="purchase_order",
    uselist=False
    )