from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy import Date, Enum as SQLEnum
from enum import Enum

from app.database import Base

class DocumentStatus(str, Enum):

    VALID = "Valid"

    EXPIRED = "Expired"

    PENDING = "Pending"

class VendorDocument(Base):
    __tablename__ = "vendor_documents"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id", ondelete="CASCADE"),
        nullable=False
    )

    document_type = Column(String(100), nullable=False)

    file_name = Column(String(255), nullable=False)

    file_path = Column(String(500), nullable=False)

    file_size = Column(Integer)

    file_type = Column(String(100))
    expiry_date = Column(Date)

    status = Column(
        SQLEnum(DocumentStatus),
        default=DocumentStatus.VALID,
        nullable=False
    )
    uploaded_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    vendor = relationship(
        "Vendor",
        back_populates="documents"
    )