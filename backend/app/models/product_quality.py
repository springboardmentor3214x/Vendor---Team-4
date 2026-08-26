from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    ForeignKey,
    Enum as SqlEnum
)

from sqlalchemy.orm import relationship

from app.database import Base


class QualityRating(str, Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    AVERAGE = "AVERAGE"
    POOR = "POOR"


class ProductQualityEvaluation(Base):
    __tablename__ = "product_quality_evaluations"

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

    inspection_date = Column(
        Date,
        nullable=False
    )

    material_quality = Column(Integer, nullable=False)
    packaging_quality = Column(Integer, nullable=False)
    quantity_accuracy = Column(Integer, nullable=False)
    specification_compliance = Column(Integer, nullable=False)
    product_defects = Column(Integer, nullable=False)

    overall_quality_rating = Column(
        SqlEnum(QualityRating),
        nullable=False
    )

    inspector_remarks = Column(String)

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="product_quality"
    )

    vendor = relationship(
        "Vendor",
        back_populates="product_quality_evaluations"
    )