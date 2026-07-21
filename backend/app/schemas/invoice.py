from datetime import date
from pydantic import BaseModel
from app.models.invoice import InvoiceStatus


class InvoiceCreate(BaseModel):
    purchase_order_id: int
    invoice_date: date


class InvoiceUpdate(BaseModel):
    invoice_date: date


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    purchase_order_id: int
    vendor_id: int
    invoice_date: date
    amount: float
    status: InvoiceStatus

    class Config:
        from_attributes = True


class InvoiceDashboard(BaseModel):
    total_invoices: int
    pending: int
    paid: int
    total_amount: float

class InvoiceDashboard(BaseModel):
    total_invoices: int
    pending: int
    paid: int
    total_amount: float