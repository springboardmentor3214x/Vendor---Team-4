from sqlalchemy.orm import Session

from app.services.email_service import send_email
from app.models.message import Message
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
    DeliveryMethod
)


def create_message(db: Session, data):
    sender = db.query(User).filter(User.id == data.sender_id).first()
    if not sender:
        return None, "Sender not found"

    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        return None, "Receiver not found"

    message = Message(
        sender_id=sender.id,
        receiver_id=receiver.id,
        purchase_order_id=data.purchase_order_id,
        message=data.message,
        is_read=False
    )
    db.add(message)
    db.flush()

    notification = Notification(
        user_id=receiver.id,
        notification_type=NotificationType.MESSAGE,
        title=f"New message from {sender.full_name}",
        description=data.message[:1000],
        related_module="Vendor Messaging",
        related_record_id=message.id,
        priority=NotificationPriority.MEDIUM,
        delivery_method=DeliveryMethod.IN_APP,
        is_read=False
    )
    db.add(notification)
    db.add(ActivityLog(
        user_id=sender.id,
        activity_type="Message Sent",
        description=f"Message sent to {receiver.full_name}"
    ))
    db.commit()
    db.refresh(message)

    if receiver.email:
        try:
            send_email(
                to_email=receiver.email,
                subject="New Vendor Message",
                body=(
                    f"Hello {receiver.full_name},\n\n"
                    f"You have received a new message from {sender.full_name}.\n\n"
                    f"Message:\n{message.message}\n\n"
                    "Please login to the Vendor Reliability Intelligence Platform."
                )
            )
        except Exception:
            pass

    return message, None


def get_messages(db: Session):
    return db.query(Message).order_by(Message.created_at.desc()).all()


def get_user_messages(db: Session, user_id: int):
    return (
        db.query(Message)
        .filter((Message.sender_id == user_id) | (Message.receiver_id == user_id))
        .order_by(Message.created_at.desc())
        .all()
    )


def get_message(db: Session, message_id: int):
    return db.query(Message).filter(Message.id == message_id).first()


def get_conversation(db: Session, sender_id: int, receiver_id: int):
    return (
        db.query(Message)
        .filter(
            ((Message.sender_id == sender_id) & (Message.receiver_id == receiver_id))
            | ((Message.sender_id == receiver_id) & (Message.receiver_id == sender_id))
        )
        .order_by(Message.created_at.asc())
        .all()
    )


def mark_as_read(db: Session, message_id: int, user_id: int):
    message = (
        db.query(Message)
        .filter(Message.id == message_id, Message.receiver_id == user_id)
        .first()
    )
    if not message:
        return None
    message.is_read = True
    db.commit()
    db.refresh(message)
    return message


def delete_message(db: Session, message_id: int):
    message = get_message(db, message_id)
    if not message:
        return False
    db.delete(message)
    db.commit()
    return True
