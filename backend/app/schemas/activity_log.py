from datetime import datetime
from pydantic import BaseModel


class ActivityLogCreate(BaseModel):

    user_id: int

    activity_type: str

    description: str


class ActivityLogResponse(ActivityLogCreate):

    id: int

    created_at: datetime

    class Config:
        from_attributes = True