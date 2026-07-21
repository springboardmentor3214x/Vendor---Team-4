from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    ForeignKey,
    Enum as SqlEnum
)

from sqlalchemy.orm import relationship

from app.database import Base


class InvoiceStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    invoice_number = Column(String, unique=True, nullable=False)

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

    invoice_date = Column(Date, nullable=False)

    amount = Column(Float, nullable=False)

    status = Column(
        SqlEnum(InvoiceStatus),
        default=InvoiceStatus.PENDING,
        nullable=False
    )

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="invoices"
    )

    vendor = relationship(
        "Vendor",
        back_populates="invoices"
    )