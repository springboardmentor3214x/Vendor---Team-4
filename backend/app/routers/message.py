from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
from app.services import message_service

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_model=MessageResponse)
def create_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data.sender_id = current_user.id
    message, error = message_service.create_message(db, data)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return message

@router.get("/", response_model=list[MessageResponse])
def get_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return message_service.get_messages(db)

@router.get("/mine", response_model=list[MessageResponse])
def get_my_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return message_service.get_user_messages(db, current_user.id)

@router.get("/conversation/{other_user_id}", response_model=list[MessageResponse])
def get_my_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    other = db.query(User).filter(User.id == other_user_id).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")
    return message_service.get_conversation(db, current_user.id, other_user_id)

@router.get("/conversation/{sender_id}/{receiver_id}", response_model=list[MessageResponse])
def get_conversation(
    sender_id: int,
    receiver_id: int,
    db: Session = Depends(get_db)
):
    return message_service.get_conversation(db, sender_id, receiver_id)

@router.patch("/{message_id}/read", response_model=MessageResponse)
def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = message_service.mark_as_read(db, message_id, current_user.id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = message_service.delete_message(db, message_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted successfully"}
