from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse
)

from app.services import message_service

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)


# ---------------------------------------------------
# Create Message
# ---------------------------------------------------

@router.post(
    "/",
    response_model=MessageResponse
)
def create_message(
    data: MessageCreate,
    db: Session = Depends(get_db)
):

    message, error = message_service.create_message(
        db,
        data
    )

    if error:

        raise HTTPException(
            status_code=404,
            detail=error
        )

    return message


# ---------------------------------------------------
# Get All Messages
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[MessageResponse]
)
def get_messages(
    db: Session = Depends(get_db)
):

    return message_service.get_messages(db)


# ---------------------------------------------------
# Get Message By ID
# ---------------------------------------------------

@router.get(
    "/{message_id}",
    response_model=MessageResponse
)
def get_message(
    message_id: int,
    db: Session = Depends(get_db)
):

    message = message_service.get_message(
        db,
        message_id
    )

    if not message:

        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return message


# ---------------------------------------------------
# Conversation Between Users
# ---------------------------------------------------

@router.get(
    "/conversation/{sender_id}/{receiver_id}",
    response_model=list[MessageResponse]
)
def get_conversation(
    sender_id: int,
    receiver_id: int,
    db: Session = Depends(get_db)
):

    return message_service.get_conversation(
        db,
        sender_id,
        receiver_id
    )


# ---------------------------------------------------
# Mark Message As Read
# ---------------------------------------------------

@router.patch(
    "/{message_id}/read",
    response_model=MessageResponse
)
def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db)
):

    message = message_service.mark_as_read(
        db,
        message_id
    )

    if not message:

        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return message


# ---------------------------------------------------
# Delete Message
# ---------------------------------------------------

@router.delete(
    "/{message_id}"
)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db)
):

    deleted = message_service.delete_message(
        db,
        message_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return {
        "message": "Message deleted successfully"
    }