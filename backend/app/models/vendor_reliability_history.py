from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class VendorReliabilityHistory(Base):
    __tablename__ = "vendor_reliability_history"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    reliability_score = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    recommendation = Column(
        String,
        nullable=False
    )

    calculated_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )