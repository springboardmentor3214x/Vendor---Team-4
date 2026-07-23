from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Float,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class VendorPerformance(Base):
    __tablename__ = "vendor_performance"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        unique=True,
        nullable=False
    )

    on_time_delivery_rate = Column(Float, default=0)

    delayed_delivery_count = Column(Integer, default=0)

    average_delivery_delay = Column(Float, default=0)

    average_quality_score = Column(Float, default=0)

    average_response_time = Column(Float, default=0)

    average_service_rating = Column(Float, default=0)

    order_completion_rate = Column(Float, default=0)

    overall_vendor_score = Column(Float, default=0)

    last_updated = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    vendor = relationship(
        "Vendor",
        back_populates="vendor_performance"
    )