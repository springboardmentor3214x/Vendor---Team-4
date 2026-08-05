from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.user import User


# ---------------------------------------------------
# Create Activity Log
# ---------------------------------------------------

def create_activity_log(db: Session, data):

    user = db.query(User).filter(
        User.id == data.user_id
    ).first()

    if not user:
        raise ValueError("User not found")

    log = ActivityLog(**data.model_dump())

    db.add(log)

    db.commit()

    db.refresh(log)

    return log


# ---------------------------------------------------
# Get All Logs
# ---------------------------------------------------

def get_activity_logs(db: Session):

    return db.query(ActivityLog).order_by(
        ActivityLog.created_at.desc()
    ).all()


# ---------------------------------------------------
# Get Log By ID
# ---------------------------------------------------

def get_activity_log(
    db: Session,
    log_id: int
):

    return db.query(ActivityLog).filter(
        ActivityLog.id == log_id
    ).first()


# ---------------------------------------------------
# Get Logs By User
# ---------------------------------------------------

def get_user_logs(
    db: Session,
    user_id: int
):

    return db.query(ActivityLog).filter(
        ActivityLog.user_id == user_id
    ).order_by(
        ActivityLog.created_at.desc()
    ).all()


# ---------------------------------------------------
# Delete Log
# ---------------------------------------------------

def delete_activity_log(
    db: Session,
    log_id: int
):

    log = get_activity_log(
        db,
        log_id
    )

    if not log:
        return None

    db.delete(log)

    db.commit()

    return True