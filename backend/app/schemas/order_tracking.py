from pydantic import BaseModel
from app.models.purchase_order import PurchaseOrderStatus

class OrderTrackingUpdate(BaseModel):
    status: PurchaseOrderStatus


class OrderTrackingResponse(BaseModel):
    purchase_order_id: int
    po_number: str
    vendor_id: int
    status: PurchaseOrderStatus

    class Config:
        from_attributes = True

class OrderTrackingDashboard(BaseModel):
    total_orders: int
    pending: int
    generated: int
    sent: int
    cancelled: int