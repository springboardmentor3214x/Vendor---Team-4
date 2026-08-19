from datetime import date
from pydantic import BaseModel, Field

from app.models.product_quality import QualityRating


class ProductQualityCreate(BaseModel):
    purchase_order_id: int
    inspection_date: date

    material_quality: int = Field(..., ge=1, le=5)
    packaging_quality: int = Field(..., ge=1, le=5)
    quantity_accuracy: int = Field(..., ge=1, le=5)
    specification_compliance: int = Field(..., ge=1, le=5)
    product_defects: int = Field(..., ge=0, le=5)

    inspector_remarks: str | None = None


class ProductQualityResponse(BaseModel):
    id: int
    purchase_order_id: int
    vendor_id: int
    inspection_date: date
    material_quality: int
    packaging_quality: int
    quantity_accuracy: int
    specification_compliance: int
    product_defects: int
    overall_quality_rating: QualityRating
    inspector_remarks: str | None = None

    class Config:
        from_attributes = True