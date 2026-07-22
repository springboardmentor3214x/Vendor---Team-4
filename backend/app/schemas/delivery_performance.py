from datetime import date
from pydantic import BaseModel
from app.models.delivery_performance import DeliveryStatus


class DeliveryPerformanceCreate(BaseModel):
    purchase_order_id: int
    actual_delivery_date: date
    remarks: str | None = None


class DeliveryPerformanceResponse(BaseModel):
    id: int
    purchase_order_id: int
    vendor_id: int
    expected_delivery_date: date
    actual_delivery_date: date
    delay_days: int
    delivery_status: DeliveryStatus
    remarks: str | None = None

    class Config:
        from_attributes = True


class DeliveryPerformanceDashboard(BaseModel):
    total_deliveries: int
    early_deliveries: int
    on_time_deliveries: int
    delayed_deliveries: int