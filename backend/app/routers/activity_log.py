from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.activity_log import (
    ActivityLogCreate,
    ActivityLogResponse
)

from app.services import activity_log_service

router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)


# ---------------------------------------------------
# Create Activity Log
# ---------------------------------------------------

@router.post(
    "/",
    response_model=ActivityLogResponse
)
def create_activity_log(
    log: ActivityLogCreate,
    db: Session = Depends(get_db)
):

    try:

        return activity_log_service.create_activity_log(
            db,
            log
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ---------------------------------------------------
# Get All Logs
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[ActivityLogResponse]
)
def get_logs(
    db: Session = Depends(get_db)
):

    return activity_log_service.get_activity_logs(db)


# ---------------------------------------------------
# Get Log By ID
# ---------------------------------------------------

@router.get(
    "/{log_id}",
    response_model=ActivityLogResponse
)
def get_log(
    log_id: int,
    db: Session = Depends(get_db)
):

    log = activity_log_service.get_activity_log(
        db,
        log_id
    )

    if not log:

        raise HTTPException(
            status_code=404,
            detail="Activity log not found"
        )

    return log


# ---------------------------------------------------
# Get User Logs
# ---------------------------------------------------

@router.get(
    "/user/{user_id}",
    response_model=list[ActivityLogResponse]
)
def get_user_logs(
    user_id: int,
    db: Session = Depends(get_db)
):

    return activity_log_service.get_user_logs(
        db,
        user_id
    )


# ---------------------------------------------------
# Delete Log
# ---------------------------------------------------

@router.delete("/{log_id}")
def delete_log(
    log_id: int,
    db: Session = Depends(get_db)
):

    deleted = activity_log_service.delete_activity_log(
        db,
        log_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Activity log not found"
        )

    return {
        "message": "Activity log deleted successfully"
    }