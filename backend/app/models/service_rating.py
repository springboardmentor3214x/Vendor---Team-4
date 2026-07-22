from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class ServiceRating(Base):
    __tablename__ = "service_ratings"

    id = Column(Integer, primary_key=True, index=True)

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        nullable=False,
        unique=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    professionalism = Column(Integer, nullable=False)
    customer_support = Column(Integer, nullable=False)
    documentation_quality = Column(Integer, nullable=False)
    flexibility = Column(Integer, nullable=False)
    communication_effectiveness = Column(Integer, nullable=False)
    issue_resolution = Column(Integer, nullable=False)

    overall_service_rating = Column(Integer, nullable=False)

    comments = Column(String)

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="service_rating"
    )

    vendor = relationship(
        "Vendor",
        back_populates="service_ratings"
    )