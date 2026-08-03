from enum import Enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Enum as SQLEnum
)

from sqlalchemy.orm import relationship

from app.database import Base


# -----------------------------------
# Certification Status
# -----------------------------------

class CertificationStatus(str, Enum):

    VALID = "Valid"

    EXPIRED = "Expired"

    PENDING = "Pending"


# -----------------------------------
# Certification Model
# -----------------------------------

class Certification(Base):

    __tablename__ = "certifications"

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

    certification_name = Column(
        String,
        nullable=False
    )

    certification_number = Column(
        String,
        unique=True,
        nullable=False
    )

    issuing_authority = Column(
        String,
        nullable=False
    )

    issue_date = Column(
        Date,
        nullable=False
    )

    expiry_date = Column(
        Date,
        nullable=False
    )

    status = Column(
        SQLEnum(CertificationStatus),
        default=CertificationStatus.VALID,
        nullable=False
    )

    document_path = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    vendor = relationship(
        "Vendor",
        back_populates="certifications"
    )