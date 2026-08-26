from datetime import datetime
from pydantic import BaseModel

class DiscussionReplyCreate(BaseModel):
    comment: str

class DiscussionReplyResponse(BaseModel):
    id: int
    discussion_id: int
    user_id: int
    comment: str
    created_at: datetime
    user_name: str | None = None
    user_role: str | None = None

    class Config:
        from_attributes = True
