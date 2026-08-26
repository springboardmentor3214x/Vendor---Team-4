from datetime import datetime
from pydantic import BaseModel


class ComplaintCreate(BaseModel):
    vendor_id: int
    title: str
    description: str


class ComplaintResponse(BaseModel):
    id: int
    vendor_id: int
    title: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True      # orm_mode = True if using Pydantic v1