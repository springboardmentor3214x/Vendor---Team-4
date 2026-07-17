from enum import Enum
from sqlalchemy.orm import relationship

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum as SQLEnum
)

from sqlalchemy.sql import func

from app.database import Base


class DocumentType(str, Enum):
    GST_CERTIFICATE = "GST Certificate"
    PAN_CARD = "PAN Card"
    COMPANY_REGISTRATION = "Company Registration Certificate"
    ISO_CERTIFICATE = "ISO Certificate"
    OTHER = "Other"


class VendorDocument(Base):

    __tablename__ = "vendor_documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    document_type = Column(
        SQLEnum(DocumentType),
        nullable=False
    )

    file_name = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    vendor = relationship(
    "Vendor",
    back_populates="documents"
    )