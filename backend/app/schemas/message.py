from datetime import datetime
from pydantic import BaseModel


# ----------------------------
# Create Message
# ----------------------------

class MessageCreate(BaseModel):

    sender_id: int | None = None

    receiver_id: int

    purchase_order_id: int | None = None

    message: str


# ----------------------------
# Update Message
# ----------------------------

class MessageUpdate(BaseModel):

    message: str


# ----------------------------
# Response
# ----------------------------

class MessageResponse(BaseModel):

    id: int

    sender_id: int

    receiver_id: int

    purchase_order_id: int | None

    message: str

    is_read: bool

    created_at: datetime

    class Config:
        from_attributes = True