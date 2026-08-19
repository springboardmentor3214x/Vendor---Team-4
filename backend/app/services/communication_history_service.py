from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.discussion import Discussion
from app.models.purchase_order import PurchaseOrder
from app.models.user import User


def _message_vendor_id(db: Session, message: Message) -> int | None:
    # A message linked to a purchase order gets its vendor from that PO.
    if message.purchase_order_id:
        po = db.query(PurchaseOrder).filter(
            PurchaseOrder.id == message.purchase_order_id
        ).first()
        if po:
            return po.vendor_id

    # Otherwise, if either participant is a Vendor user, use that user's id
    # only when the user record also represents a vendor-facing account.
    receiver = db.query(User).filter(User.id == message.receiver_id).first()
    if receiver and str(receiver.role).strip().lower() == "vendor":
        return receiver.id

    sender = db.query(User).filter(User.id == message.sender_id).first()
    if sender and str(sender.role).strip().lower() == "vendor":
        return sender.id

    return None


def get_history(db: Session):
    history = []

    messages = (
        db.query(Message)
        .order_by(Message.created_at.desc())
        .all()
    )

    for message in messages:
        history.append({
            "type": "Message",
            "reference_id": message.id,
            "purchase_order_id": message.purchase_order_id,
            "vendor_id": _message_vendor_id(db, message),
            "user_id": message.sender_id,
            "title": "Direct Message",
            "description": message.message,
            "status": "Read" if message.is_read else "Unread",
            "created_at": message.created_at
        })

    discussions = (
        db.query(Discussion)
        .order_by(Discussion.created_at.desc())
        .all()
    )

    for discussion in discussions:
        vendor_id = None
        if discussion.purchase_order_id and discussion.purchase_order:
            vendor_id = discussion.purchase_order.vendor_id

        history.append({
            "type": "Discussion",
            "reference_id": discussion.id,
            "purchase_order_id": discussion.purchase_order_id,
            "vendor_id": vendor_id,
            "user_id": discussion.created_by,
            "title": discussion.title,
            "description": discussion.description,
            "status": getattr(discussion.status, "value", discussion.status),
            "created_at": discussion.created_at
        })

    history.sort(
        key=lambda x: x["created_at"],
        reverse=True
    )

    return history


def get_user_history(db: Session, user_id: int):
    return [
        item for item in get_history(db)
        if item["user_id"] == user_id
    ]


def get_purchase_order_history(db: Session, purchase_order_id: int):
    return [
        item for item in get_history(db)
        if item["purchase_order_id"] == purchase_order_id
    ]


def get_discussion_history(db: Session, discussion_id: int):
    discussion = db.query(Discussion).filter(
        Discussion.id == discussion_id
    ).first()

    if not discussion:
        return None

    vendor_id = None
    if discussion.purchase_order_id and discussion.purchase_order:
        vendor_id = discussion.purchase_order.vendor_id

    return {
        "type": "Discussion",
        "reference_id": discussion.id,
        "purchase_order_id": discussion.purchase_order_id,
        "vendor_id": vendor_id,
        "user_id": discussion.created_by,
        "title": discussion.title,
        "description": discussion.description,
        "status": getattr(discussion.status, "value", discussion.status),
        "created_at": discussion.created_at
    }
