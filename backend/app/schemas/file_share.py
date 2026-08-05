from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class FileShareCreate(BaseModel):

    file_name: str

    file_path: str

    file_type: str

    uploaded_by: int

    vendor_id: Optional[int] = None

    purchase_order_id: Optional[int] = None

    discussion_id: Optional[int] = None


class FileShareResponse(FileShareCreate):

    id: int

    uploaded_at: datetime

    class Config:
        from_attributes = True