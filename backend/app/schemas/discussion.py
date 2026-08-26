from datetime import datetime
from pydantic import BaseModel


class DiscussionCreate(BaseModel):

    title: str

    description: str

    purchase_order_id: int

    created_by: int | None = None


class DiscussionUpdate(BaseModel):

    title: str

    description: str

    status: str


class DiscussionResponse(BaseModel):

    id: int

    title: str

    description: str

    purchase_order_id: int

    created_by: int

    status: str

    created_at: datetime

    class Config:
        from_attributes = True