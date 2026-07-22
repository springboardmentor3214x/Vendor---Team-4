from pydantic import BaseModel
from datetime import date

class VendorPerformanceResponse(BaseModel):
    vendor_id: int
    vendor_name: str

    average_delivery_delay: float
    on_time_delivery_rate: float
    delayed_delivery_count: int

    average_quality_score: float

    average_response_time: float

    average_service_rating: float

    order_completion_rate: float

    overall_vendor_score: float

    class Config:
        from_attributes = True

class VendorDashboardResponse(BaseModel):
    total_vendors: int
    total_completed_orders: int
    delayed_deliveries: int

    average_delivery_performance: float
    average_quality_rating: float
    average_response_time: float

    average_vendor_score: float

    best_vendor: str | None
    worst_vendor: str | None

class VendorRankingResponse(BaseModel):
    rank: int

    vendor_id: int
    vendor_name: str
    vendor_category: str | None = None

    delivery_score: float
    quality_score: float
    communication_score: float
    service_rating: float

    overall_vendor_score: float

class VendorPerformanceHistoryResponse(BaseModel):
    purchase_order_id: int
    expected_delivery_date: date | None
    actual_delivery_date: date | None

    delivery_delay: int
    quality_score: float
    response_time: int
    service_rating: int
    overall_score: float

    class Config:
        from_attributes = True