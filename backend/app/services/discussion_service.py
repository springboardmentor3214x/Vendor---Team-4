from sqlalchemy.orm import Session
from app.services.email_service import send_email
from app.models.discussion import Discussion
from app.models.user import User
from app.models.purchase_order import PurchaseOrder
from app.models.activity_log import ActivityLog


# ---------------------------------------------------
# Create Discussion
# ---------------------------------------------------

def create_discussion(db: Session, data):

    user = db.query(User).filter(
        User.id == data.created_by
    ).first()

    if not user:
        return None, "User not found"

    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == data.purchase_order_id
    ).first()

    if not po:
        return None, "Purchase Order not found"

    discussion = Discussion(**data.model_dump())

    db.add(discussion)
    db.flush()
    db.add(ActivityLog(
        user_id=discussion.created_by,
        activity_type="Discussion Created",
        description=f"{discussion.title} | Purchase Order #{discussion.purchase_order_id}"
    ))
    db.commit()
    db.refresh(discussion)
    creator = db.query(User).filter(
        User.id == discussion.created_by
    ).first()

    if creator and creator.email:
        try:
            send_email(
                creator.email,
                "Discussion Created",
                f"""
    Hello {creator.full_name},

    A new procurement discussion has been created.

    Title:
    {discussion.title}

    Please login to continue the discussion.

    Regards,
    Vendor Reliability Intelligence Platform
    """
            )
        except Exception:
            pass

    return discussion, None


# ---------------------------------------------------
# Get All Discussions
# ---------------------------------------------------

def get_discussions(db: Session):

    return db.query(Discussion).all()


# ---------------------------------------------------
# Get Discussion By ID
# ---------------------------------------------------

def get_discussion(db: Session, discussion_id: int):

    return db.query(Discussion).filter(
        Discussion.id == discussion_id
    ).first()


# ---------------------------------------------------
# Get Discussions By Purchase Order
# ---------------------------------------------------

def get_purchase_order_discussions(
    db: Session,
    purchase_order_id: int
):

    return db.query(Discussion).filter(
        Discussion.purchase_order_id == purchase_order_id
    ).all()


# ---------------------------------------------------
# Update Discussion
# ---------------------------------------------------

def update_discussion(
    db: Session,
    discussion_id: int,
    data
):

    discussion = get_discussion(
        db,
        discussion_id
    )

    if not discussion:
        return None

    update_data = data.model_dump()

    for key, value in update_data.items():
        setattr(discussion, key, value)

    db.commit()
    db.refresh(discussion)

    return discussion


# ---------------------------------------------------
# Delete Discussion
# ---------------------------------------------------

def delete_discussion(
    db: Session,
    discussion_id: int
):

    discussion = get_discussion(
        db,
        discussion_id
    )

    if not discussion:
        return False

    db.delete(discussion)
    db.commit()

    return True