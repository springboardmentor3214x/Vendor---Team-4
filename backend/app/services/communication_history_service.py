from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.discussion import Discussion


# ---------------------------------------------------
# Get Complete Communication History
# ---------------------------------------------------

def get_history(db: Session):

    history = []

    messages = db.query(Message).all()

    for message in messages:

        history.append({

            "type": "Message",

            "reference_id": message.id,

            "purchase_order_id": message.purchase_order_id,

            "user_id": message.sender_id,

            "title": "Direct Message",

            "description": message.message,

            "created_at": message.created_at

        })

    discussions = db.query(Discussion).all()

    for discussion in discussions:

        history.append({

            "type": "Discussion",

            "reference_id": discussion.id,

            "purchase_order_id": discussion.purchase_order_id,

            "user_id": discussion.created_by,

            "title": discussion.title,

            "description": discussion.description,

            "created_at": discussion.created_at

        })

    history.sort(
        key=lambda x: x["created_at"],
        reverse=True
    )

    return history


# ---------------------------------------------------
# User History
# ---------------------------------------------------

def get_user_history(
    db: Session,
    user_id: int
):

    return [

        item

        for item in get_history(db)

        if item["user_id"] == user_id

    ]


# ---------------------------------------------------
# Purchase Order History
# ---------------------------------------------------

def get_purchase_order_history(
    db: Session,
    purchase_order_id: int
):

    return [

        item

        for item in get_history(db)

        if item["purchase_order_id"] == purchase_order_id

    ]


# ---------------------------------------------------
# Discussion History
# ---------------------------------------------------

def get_discussion_history(
    db: Session,
    discussion_id: int
):

    discussion = db.query(Discussion).filter(
        Discussion.id == discussion_id
    ).first()

    if not discussion:
        return None

    return {

        "type": "Discussion",

        "reference_id": discussion.id,

        "purchase_order_id": discussion.purchase_order_id,

        "user_id": discussion.created_by,

        "title": discussion.title,

        "description": discussion.description,

        "created_at": discussion.created_at

    }