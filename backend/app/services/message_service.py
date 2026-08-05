from sqlalchemy.orm import Session
from app.services.email_service import send_email

from app.models.message import Message
from app.models.user import User


# ---------------------------------------
# Create Message
# ---------------------------------------

def create_message(db: Session, data):

    sender = db.query(User).filter(
        User.id == data.sender_id
    ).first()

    if not sender:
        return None, "Sender not found"

    receiver = db.query(User).filter(
        User.id == data.receiver_id
    ).first()

    if not receiver:
        return None, "Receiver not found"

    message = Message(**data.model_dump())

    db.add(message)

    db.commit()

    db.refresh(message)
    receiver = db.query(User).filter(
        User.id == message.receiver_id
    ).first()

    sender = db.query(User).filter(
        User.id == message.sender_id
    ).first()

    if receiver and receiver.email:

        send_email(
            to_email=receiver.email,
            subject="New Vendor Message",
            body=f"""
    Hello {receiver.full_name},

    You have received a new message from {sender.full_name}.

    Message:
    {message.message}

    Please login to the Vendor Reliability Intelligence Platform to view and reply.

    Regards,
    Vendor Reliability Intelligence Platform
    """
        )

    return message, None


# ---------------------------------------
# Get All Messages
# ---------------------------------------

def get_messages(db: Session):

    return db.query(Message).all()


# ---------------------------------------
# Get Message
# ---------------------------------------

def get_message(db: Session, message_id: int):

    return db.query(Message).filter(
        Message.id == message_id
    ).first()


# ---------------------------------------
# Conversation
# ---------------------------------------

def get_conversation(
    db: Session,
    sender_id: int,
    receiver_id: int
):

    return (

        db.query(Message)

        .filter(

            (
                (Message.sender_id == sender_id)
                &
                (Message.receiver_id == receiver_id)
            )

            |

            (
                (Message.sender_id == receiver_id)
                &
                (Message.receiver_id == sender_id)
            )

        )

        .order_by(Message.created_at)

        .all()

    )


# ---------------------------------------
# Mark As Read
# ---------------------------------------

def mark_as_read(
    db: Session,
    message_id: int
):

    message = get_message(
        db,
        message_id
    )

    if not message:
        return None

    message.is_read = True

    db.commit()

    db.refresh(message)

    return message


# ---------------------------------------
# Delete Message
# ---------------------------------------

def delete_message(
    db: Session,
    message_id: int
):

    message = get_message(
        db,
        message_id
    )

    if not message:
        return False

    db.delete(message)

    db.commit()

    return True