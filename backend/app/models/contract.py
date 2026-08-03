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


# -----------------------------
# Contract Status
# -----------------------------

class ContractStatus(str, Enum):

    ACTIVE = "Active"

    EXPIRED = "Expired"

    RENEWED = "Renewed"

    TERMINATED = "Terminated"


# -----------------------------
# Contract Model
# -----------------------------

class Contract(Base):

    __tablename__ = "contracts"

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

    contract_number = Column(
        String,
        unique=True,
        nullable=False
    )

    contract_title = Column(
        String,
        nullable=False
    )

    contract_type = Column(
        String,
        nullable=False
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=False
    )

    contract_value = Column(
        Integer,
        nullable=False
    )

    status = Column(
        SQLEnum(ContractStatus),
        default=ContractStatus.ACTIVE,
        nullable=False
    )

    description = Column(String)

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
        back_populates="contracts"
    )