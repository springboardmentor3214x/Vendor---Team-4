from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from typing import Optional
from fastapi import Query
from sqlalchemy import asc, desc

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.purchase_order import (
    PurchaseOrder,
    PurchaseOrderStatus
)
from app.models.procurement_request import (
    ProcurementRequest,
    ProcurementStatus
)

from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    PurchaseOrderResponse
)
from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
    DeliveryMethod
)
router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Order Management"]
)
def generate_po_number(db: Session):
    last_po = (
        db.query(PurchaseOrder)
        .order_by(PurchaseOrder.id.desc())
        .first()
    )

    if last_po:
        last_number = int(last_po.po_number.replace("PO", ""))
        return f"PO{last_number + 1:06d}"

    return "PO000001"
@router.post(
    "",
    response_model=PurchaseOrderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_purchase_order(
    request: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if procurement request exists
    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.id == request.procurement_request_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement request not found."
        )

    # Procurement must be approved
    if procurement.request_status != ProcurementStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Only approved procurement requests can generate a purchase order."
        )

    # Vendor must be assigned
    if procurement.vendor_id is None:
        raise HTTPException(
            status_code=400,
            detail="Assign a vendor before generating a purchase order."
        )

    # Prevent duplicate Purchase Orders
    existing_po = db.query(PurchaseOrder).filter(
        PurchaseOrder.procurement_request_id == procurement.id
    ).first()

    if existing_po:
        raise HTTPException(
            status_code=400,
            detail="Purchase Order already exists for this procurement request."
        )

    # Generate PO Number
    po_number = generate_po_number(db)

    # Calculate total cost
    total_cost = procurement.quantity * request.unit_price

    purchase_order = PurchaseOrder(
        po_number=po_number,
        procurement_request_id=procurement.id,
        vendor_id=procurement.vendor_id,
        purchase_order_date=request.purchase_order_date,
        expected_delivery_date=request.expected_delivery_date,
        quantity_ordered=procurement.quantity,
        unit_price=request.unit_price,
        total_cost=total_cost,
        tax_details=request.tax_details,
        shipping_address=request.shipping_address,
        payment_terms=request.payment_terms,
        status=PurchaseOrderStatus.PENDING,
        approved_by=current_user.id
    )

    db.add(purchase_order)
    db.commit()
    db.refresh(purchase_order)
    notification = Notification(

        user_id=current_user.id,

        notification_type=NotificationType.PURCHASE_ORDER,

        title="Purchase Order Created",

        description=(
            f"Purchase Order {purchase_order.po_number} "
            f"has been created successfully."
        ),

        related_module="Purchase Order",

        related_record_id=purchase_order.id,

        priority=NotificationPriority.MEDIUM,

        delivery_method=DeliveryMethod.IN_APP
    )

    db.add(notification)

    db.commit()

    return PurchaseOrderResponse(
        id=purchase_order.id,
        po_number=purchase_order.po_number,
        procurement_request_id=purchase_order.procurement_request_id,
        vendor_id=purchase_order.vendor_id,
        purchase_order_date=purchase_order.purchase_order_date,
        expected_delivery_date=purchase_order.expected_delivery_date,
        quantity_ordered=purchase_order.quantity_ordered,
        unit_price=purchase_order.unit_price,
        total_cost=purchase_order.total_cost,
        tax_details=purchase_order.tax_details,
        shipping_address=purchase_order.shipping_address,
        payment_terms=purchase_order.payment_terms,
        status=purchase_order.status.value
    )
{
  "procurement_request_id": 4,
  "purchase_order_date": "2026-07-21",
  "expected_delivery_date": "2026-07-30",
  "unit_price": 5000,
  "tax_details": "18% GST",
  "shipping_address": "Hyderabad",
  "payment_terms": "Net 30 Days"
}
@router.get(
    "",
    response_model=list[PurchaseOrderResponse]
)
def get_all_purchase_orders(
    status: Optional[PurchaseOrderStatus] = Query(None),
    vendor_id: Optional[int] = Query(None),
    po_number: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("id"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PurchaseOrder)

    # Filter by Status
    if status:
        query = query.filter(PurchaseOrder.status == status)

    # Filter by Vendor
    if vendor_id:
        query = query.filter(PurchaseOrder.vendor_id == vendor_id)

    # Search by PO Number
    if po_number:
        query = query.filter(
            PurchaseOrder.po_number.ilike(f"%{po_number}%")
        )

    # Date Range
    if start_date:
        query = query.filter(
            PurchaseOrder.purchase_order_date >= start_date
        )

    if end_date:
        query = query.filter(
            PurchaseOrder.purchase_order_date <= end_date
        )

    # Sorting
    sort_columns = {
        "id": PurchaseOrder.id,
        "po_number": PurchaseOrder.po_number,
        "purchase_order_date": PurchaseOrder.purchase_order_date,
        "expected_delivery_date": PurchaseOrder.expected_delivery_date,
        "total_cost": PurchaseOrder.total_cost
    }

    column = sort_columns.get(sort_by, PurchaseOrder.id)

    if sort_order.lower() == "asc":
        query = query.order_by(asc(column))
    else:
        query = query.order_by(desc(column))

    # Pagination
    purchase_orders = (
        query.offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return [
        PurchaseOrderResponse(
            id=po.id,
            po_number=po.po_number,
            procurement_request_id=po.procurement_request_id,
            vendor_id=po.vendor_id,
            purchase_order_date=po.purchase_order_date,
            expected_delivery_date=po.expected_delivery_date,
            quantity_ordered=po.quantity_ordered,
            unit_price=po.unit_price,
            total_cost=po.total_cost,
            tax_details=po.tax_details,
            shipping_address=po.shipping_address,
            payment_terms=po.payment_terms,
            status=po.status.value
        )
        for po in purchase_orders
    ]
@router.get(
    "/{purchase_order_id}",
    response_model=PurchaseOrderResponse
)
def get_purchase_order(
    purchase_order_id: int,
    db: Session =Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found."
        )

    return PurchaseOrderResponse(
        id=purchase_order.id,
        po_number=purchase_order.po_number,
        procurement_request_id=purchase_order.procurement_request_id,
        vendor_id=purchase_order.vendor_id,
        purchase_order_date=purchase_order.purchase_order_date,
        expected_delivery_date=purchase_order.expected_delivery_date,
        quantity_ordered=purchase_order.quantity_ordered,
        unit_price=purchase_order.unit_price,
        total_cost=purchase_order.total_cost,
        tax_details=purchase_order.tax_details,
        shipping_address=purchase_order.shipping_address,
        payment_terms=purchase_order.payment_terms,
        status=purchase_order.status.value
    )
@router.put(
    "/{purchase_order_id}",
    response_model=PurchaseOrderResponse
)
def update_purchase_order(
    purchase_order_id: int,
    request: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found."
        )

    if request.expected_delivery_date is not None:
        purchase_order.expected_delivery_date = request.expected_delivery_date

    if request.unit_price is not None:
        purchase_order.unit_price = request.unit_price
        purchase_order.total_cost = (
            purchase_order.quantity_ordered * request.unit_price
        )

    if request.tax_details is not None:
        purchase_order.tax_details = request.tax_details

    if request.shipping_address is not None:
        purchase_order.shipping_address = request.shipping_address

    if request.payment_terms is not None:
        purchase_order.payment_terms = request.payment_terms

    db.commit()
    db.refresh(purchase_order)

    return PurchaseOrderResponse(
        id=purchase_order.id,
        po_number=purchase_order.po_number,
        procurement_request_id=purchase_order.procurement_request_id,
        vendor_id=purchase_order.vendor_id,
        purchase_order_date=purchase_order.purchase_order_date,
        expected_delivery_date=purchase_order.expected_delivery_date,
        quantity_ordered=purchase_order.quantity_ordered,
        unit_price=purchase_order.unit_price,
        total_cost=purchase_order.total_cost,
        tax_details=purchase_order.tax_details,
        shipping_address=purchase_order.shipping_address,
        payment_terms=purchase_order.payment_terms,
        status=purchase_order.status.value
    )
@router.patch(
    "/{purchase_order_id}/cancel",
    response_model=PurchaseOrderResponse
)
def cancel_purchase_order(
    purchase_order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found."
        )

    if purchase_order.status == PurchaseOrderStatus.CANCELLED:
        raise HTTPException(
            status_code=400,
            detail="Purchase Order is already cancelled."
        )

    purchase_order.status = PurchaseOrderStatus.CANCELLED

    db.commit()
    db.refresh(purchase_order)

    return PurchaseOrderResponse(
        id=purchase_order.id,
        po_number=purchase_order.po_number,
        procurement_request_id=purchase_order.procurement_request_id,
        vendor_id=purchase_order.vendor_id,
        purchase_order_date=purchase_order.purchase_order_date,
        expected_delivery_date=purchase_order.expected_delivery_date,
        quantity_ordered=purchase_order.quantity_ordered,
        unit_price=purchase_order.unit_price,
        total_cost=purchase_order.total_cost,
        tax_details=purchase_order.tax_details,
        shipping_address=purchase_order.shipping_address,
        payment_terms=purchase_order.payment_terms,
        status=purchase_order.status.value
    )