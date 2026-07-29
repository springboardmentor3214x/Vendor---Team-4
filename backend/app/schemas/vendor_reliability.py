from datetime import datetime

from pydantic import BaseModel


class VendorReliabilityResponse(BaseModel):
    vendor_id: int
    vendor_name: str

    reliability_score: float

    risk_level: str

    recommendation: str

    last_calculated: datetime

    class Config:
        from_attributes = True

class VendorReliabilityHistoryResponse(BaseModel):
    id: int
    vendor_id: int
    reliability_score: float
    risk_level: str
    recommendation: str
    calculated_at: datetime

    class Config:
        from_attributes = True

class VendorReliabilityDashboard(BaseModel):
    total_vendors: int
    average_reliability_score: float

    high_reliability_vendors: int
    medium_reliability_vendors: int
    high_risk_vendors: int

    top_vendor: str | None = None
    recommended_vendors: int

class VendorReliabilityRanking(BaseModel):
    rank: int
    vendor_id: int
    vendor_name: str
    vendor_category: str
    reliability_score: float
    risk_level: str
    recommendation: str

    class Config:
        from_attributes = True

class VendorTrendResponse(BaseModel):
    vendor_id: int
    vendor_name: str
    reliability_score: float
    trend: str

    class Config:
        from_attributes = True

class ProcurementRecommendationResponse(BaseModel):
    vendor_id: int
    vendor_name: str
    reliability_score: float
    recommendation: str

    class Config:
        from_attributes = True