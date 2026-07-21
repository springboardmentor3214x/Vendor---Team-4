from enum import Enum
from sqlalchemy.orm import relationship
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Enum as SQLEnum
)

from sqlalchemy.sql import func
from app.models.vendor_document import VendorDocument
from app.database import Base


# -----------------------------
# Vendor Category
# -----------------------------
class VendorCategory(str, Enum):
    RAW_MATERIAL = "Raw Material Suppliers"
    EQUIPMENT = "Equipment Vendors"
    IT = "IT Vendors"
    SERVICE = "Service Providers"
    LOGISTICS = "Logistics Partners"
    MAINTENANCE = "Maintenance Vendors"


# -----------------------------
# Vendor Status
# -----------------------------
class VendorStatus(str, Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SUSPENDED = "Suspended"
    REJECTED = "Rejected"


# -----------------------------
# Approval Status
# -----------------------------
class ApprovalStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


# -----------------------------
# Vendor Model
# -----------------------------
class Vendor(Base):

    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        String,
        unique=True,
        nullable=False
    )

    company_name = Column(
        String,
        unique=True,
        nullable=False
    )

    vendor_category = Column(
        SQLEnum(VendorCategory),
        nullable=False
    )

    contact_person = Column(
        String,
        nullable=False
    )

    designation = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    phone = Column(
        String,
        nullable=False
    )

    alternate_phone = Column(String)

    gst_number = Column(
        String,
        unique=True,
        nullable=False
    )

    pan_number = Column(
        String,
        unique=True,
        nullable=False
    )

    company_registration_number = Column(
        String,
        unique=True,
        nullable=False
    )

    address_line1 = Column(
        String,
        nullable=False
    )

    address_line2 = Column(String)

    city = Column(
        String,
        nullable=False
    )

    state = Column(
        String,
        nullable=False
    )

    country = Column(
        String,
        nullable=False
    )

    pincode = Column(
        String,
        nullable=False
    )

    website = Column(String)

    description = Column(String)

    bank_account_number = Column(String)

    ifsc_code = Column(String)

    payment_terms = Column(String)

    vendor_status = Column(
        SQLEnum(VendorStatus),
        default=VendorStatus.PENDING,
        nullable=False
    )

    approval_status = Column(
        SQLEnum(ApprovalStatus),
        default=ApprovalStatus.PENDING,
        nullable=False
    )

    created_by = Column(
        Integer,
        nullable=False
    )

    updated_by = Column(Integer)

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

    approved_at = Column(
        DateTime(timezone=True)
    )

    documents = relationship(
    "VendorDocument",
    back_populates="vendor",
    cascade="all, delete-orphan"
    )
    procurement_requests = relationship(
    "ProcurementRequest",
    back_populates="vendor"
    )
    purchase_orders = relationship(
    "PurchaseOrder",
    back_populates="vendor"
    )
    invoices = relationship(
    "Invoice",
    back_populates="vendor"
    )