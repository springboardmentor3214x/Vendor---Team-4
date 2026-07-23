from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class VendorReliability(Base):
    __tablename__ = "vendor_reliability"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        unique=True,
        nullable=False
    )

    reliability_score = Column(
        Float,
        nullable=False,
        default=0
    )

    risk_level = Column(
        String,
        nullable=False
    )

    recommendation = Column(
        String,
        nullable=False
    )

    last_calculated = Column(
        DateTime,
        default=datetime.utcnow
    )

    vendor = relationship(
        "Vendor",
        back_populates="vendor_reliability"
    )