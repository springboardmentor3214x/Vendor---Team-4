from pydantic import BaseModel, Field


class ServiceRatingCreate(BaseModel):
    purchase_order_id: int

    professionalism: int = Field(..., ge=1, le=5)
    customer_support: int = Field(..., ge=1, le=5)
    documentation_quality: int = Field(..., ge=1, le=5)
    flexibility: int = Field(..., ge=1, le=5)
    communication_effectiveness: int = Field(..., ge=1, le=5)
    issue_resolution: int = Field(..., ge=1, le=5)

    comments: str | None = None


class ServiceRatingResponse(BaseModel):
    id: int
    purchase_order_id: int
    vendor_id: int
    professionalism: int
    customer_support: int
    documentation_quality: int
    flexibility: int
    communication_effectiveness: int
    issue_resolution: int
    overall_service_rating: int
    comments: str | None = None

    class Config:
        from_attributes = True