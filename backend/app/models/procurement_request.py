from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Date,
    DateTime,
    Enum,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class ProcurementPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class ProcurementStatus(str, enum.Enum):
    DRAFT = "Draft"
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class ApprovalStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id = Column(Integer, primary_key=True, index=True)

    request_number = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )

    request_title = Column(String(255), nullable=False)

    department_name = Column(String(100), nullable=False)

    requested_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=True
    )

    item_name = Column(String(255), nullable=False)

    product_category = Column(String(100), nullable=False)

    quantity = Column(Integer, nullable=False)

    unit = Column(String(50), nullable=False)

    estimated_budget = Column(Float, nullable=False)

    required_delivery_date = Column(Date, nullable=False)

    priority = Column(
        Enum(ProcurementPriority, name="procurementpriority"),
        default=ProcurementPriority.MEDIUM,
        nullable=False
    )

    business_justification = Column(Text, nullable=False)

    additional_remarks = Column(Text, nullable=True)

    supporting_document = Column(String(255), nullable=True)

    request_status = Column(
        Enum(ProcurementStatus, name="procurementstatus"),
        default=ProcurementStatus.PENDING,
        nullable=False
    )

    approval_status = Column(
        Enum(ApprovalStatus, name="approvalstatus"),
        default=ApprovalStatus.PENDING,
        nullable=False
    )

    approval_remarks = Column(
        Text,
        nullable=True
    )

    approved_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    approved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

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

    requester = relationship(
        "User",
        foreign_keys=[requested_by],
        back_populates="procurement_requests"
    )

    approver = relationship(
        "User",
        foreign_keys=[approved_by],
        back_populates="approved_procurements"
    )

    vendor = relationship(
        "Vendor",
        back_populates="procurement_requests"
    )

    purchase_orders = relationship(
    "PurchaseOrder",
    back_populates="procurement_request"
    )