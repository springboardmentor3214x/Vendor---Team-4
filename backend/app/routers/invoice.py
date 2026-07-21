from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.invoice import Invoice, InvoiceStatus

from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceDashboard
)

router = APIRouter(
    prefix="/invoices",
    tags=["Invoice Management"]
)
@router.post("", response_model=InvoiceResponse)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == invoice.purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    existing = db.query(Invoice).filter(
        Invoice.purchase_order_id == invoice.purchase_order_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Invoice already exists for this Purchase Order"
        )

    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    new_invoice = Invoice(
        invoice_number=invoice_number,
        purchase_order_id=purchase_order.id,
        vendor_id=purchase_order.vendor_id,
        invoice_date=invoice.invoice_date,
        amount=purchase_order.total_cost,
        status=InvoiceStatus.PENDING
    )

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    return new_invoice
@router.get("", response_model=list[InvoiceResponse])
def get_all_invoices(
    status: InvoiceStatus = None,
    vendor_id: int = None,
    invoice_number: str = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)

    if status:
        query = query.filter(Invoice.status == status)

    if vendor_id:
        query = query.filter(Invoice.vendor_id == vendor_id)

    if invoice_number:
        query = query.filter(
            Invoice.invoice_number.ilike(f"%{invoice_number}%")
        )

    sort_column = getattr(Invoice, sort_by, Invoice.id)

    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    invoices = query.offset((page - 1) * page_size).limit(page_size).all()

    return invoices
@router.get("/dashboard", response_model=InvoiceDashboard)
def invoice_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(Invoice).count()

    pending = db.query(Invoice).filter(
        Invoice.status == InvoiceStatus.PENDING
    ).count()

    paid = db.query(Invoice).filter(
        Invoice.status == InvoiceStatus.PAID
    ).count()

    total_amount = sum(
        invoice.amount
        for invoice in db.query(Invoice).all()
    )

    return InvoiceDashboard(
        total_invoices=total,
        pending=pending,
        paid=paid,
        total_amount=total_amount
    )
@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    return invoice
@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    invoice.invoice_date = invoice_data.invoice_date

    db.commit()
    db.refresh(invoice)

    return invoice
@router.patch("/{invoice_id}/mark-paid", response_model=InvoiceResponse)
def mark_invoice_paid(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    invoice.status = InvoiceStatus.PAID

    db.commit()
    db.refresh(invoice)

    return invoice