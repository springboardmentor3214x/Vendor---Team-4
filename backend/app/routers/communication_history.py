from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.communication_history import (
    CommunicationHistoryResponse
)

from app.services import communication_history_service

router = APIRouter(
    prefix="/communication-history",
    tags=["Communication History"]
)


# ---------------------------------------------------
# Get Complete Communication History
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[CommunicationHistoryResponse]
)
def get_history(
    db: Session = Depends(get_db)
):

    return communication_history_service.get_history(db)


# ---------------------------------------------------
# User Communication History
# ---------------------------------------------------

@router.get(
    "/user/{user_id}",
    response_model=list[CommunicationHistoryResponse]
)
def get_user_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    return communication_history_service.get_user_history(
        db,
        user_id
    )


# ---------------------------------------------------
# Purchase Order History
# ---------------------------------------------------

@router.get(
    "/purchase-order/{purchase_order_id}",
    response_model=list[CommunicationHistoryResponse]
)
def get_purchase_order_history(
    purchase_order_id: int,
    db: Session = Depends(get_db)
):

    return communication_history_service.get_purchase_order_history(
        db,
        purchase_order_id
    )


# ---------------------------------------------------
# Discussion History
# ---------------------------------------------------

@router.get(
    "/discussion/{discussion_id}",
    response_model=CommunicationHistoryResponse
)
def get_discussion_history(
    discussion_id: int,
    db: Session = Depends(get_db)
):

    discussion = communication_history_service.get_discussion_history(
        db,
        discussion_id
    )

    if not discussion:

        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    return discussion