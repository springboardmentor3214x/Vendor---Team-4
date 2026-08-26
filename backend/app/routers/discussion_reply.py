from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.discussion import Discussion
from app.models.discussion_reply import DiscussionReply
from app.models.user import User
from app.models.notification import Notification, NotificationType, NotificationPriority, DeliveryMethod
from app.models.activity_log import ActivityLog
from app.schemas.discussion_reply import DiscussionReplyCreate, DiscussionReplyResponse

router = APIRouter(prefix="/discussions", tags=["Discussion Replies"])

def serialize(reply: DiscussionReply):
    return {
        "id": reply.id,
        "discussion_id": reply.discussion_id,
        "user_id": reply.user_id,
        "comment": reply.comment,
        "created_at": reply.created_at,
        "user_name": reply.user.full_name if reply.user else None,
        "user_role": reply.user.role if reply.user else None
    }

@router.get("/{discussion_id}/replies", response_model=list[DiscussionReplyResponse])
def get_replies(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    if not db.query(Discussion).filter(Discussion.id == discussion_id).first():
        raise HTTPException(status_code=404, detail="Discussion not found")

    rows = (
        db.query(DiscussionReply)
        .filter(DiscussionReply.discussion_id == discussion_id)
        .order_by(DiscussionReply.created_at.asc())
        .all()
    )
    return [serialize(row) for row in rows]

@router.post("/{discussion_id}/replies", response_model=DiscussionReplyResponse)
def create_reply(
    discussion_id: int,
    data: DiscussionReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    if str(discussion.status).upper().endswith("CLOSED"):
        raise HTTPException(status_code=400, detail="Closed discussions cannot receive new replies")
    if not data.comment.strip():
        raise HTTPException(status_code=400, detail="Reply cannot be empty")

    reply = DiscussionReply(
        discussion_id=discussion_id,
        user_id=current_user.id,
        comment=data.comment.strip()
    )
    db.add(reply)
    db.flush()

    db.add(ActivityLog(
        user_id=current_user.id,
        activity_type="Discussion Reply",
        description=f"Reply added to discussion #{discussion.id}"
    ))

    if discussion.created_by != current_user.id:
        db.add(Notification(
            user_id=discussion.created_by,
            notification_type=NotificationType.MESSAGE,
            title=f"New reply: {discussion.title}",
            description=data.comment[:1000],
            related_module="Procurement Discussions",
            related_record_id=discussion.id,
            priority=NotificationPriority.MEDIUM,
            delivery_method=DeliveryMethod.IN_APP,
            is_read=False
        ))

    db.commit()
    db.refresh(reply)
    return serialize(reply)
