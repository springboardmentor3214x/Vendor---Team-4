from datetime import date
from typing import Optional
from pydantic import BaseModel


# -----------------------------
# Create Purchase Order
# -----------------------------
class PurchaseOrderCreate(BaseModel):
    procurement_request_id: int
    purchase_order_date: date
    expected_delivery_date: date
    unit_price: float
    tax_details: Optional[str] = None
    shipping_address: Optional[str] = None
    payment_terms: Optional[str] = None


# -----------------------------
# Update Purchase Order
# -----------------------------
class PurchaseOrderUpdate(BaseModel):
    expected_delivery_date: Optional[date] = None
    unit_price: Optional[float] = None
    tax_details: Optional[str] = None
    shipping_address: Optional[str] = None
    payment_terms: Optional[str] = None


# -----------------------------
# Purchase Order Response
# -----------------------------
class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    procurement_request_id: int
    vendor_id: int
    purchase_order_date: date
    expected_delivery_date: date
    quantity_ordered: int
    unit_price: float
    total_cost: float
    tax_details: Optional[str]
    shipping_address: Optional[str]
    payment_terms: Optional[str]
    status: str
    vendor_name: Optional[str] = None
    request_title: Optional[str] = None
    item_name: Optional[str] = None
    product_category: Optional[str] = None
    department_name: Optional[str] = None
    invoice_status: Optional[str] = None

    class Config:
        from_attributes = True