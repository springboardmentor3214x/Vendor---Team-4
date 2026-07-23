from datetime import datetime
from pydantic import BaseModel


class VendorIssueCreate(BaseModel):
    vendor_id: int
    issue_type: str
    description: str


class VendorIssueResponse(BaseModel):
    id: int
    vendor_id: int
    issue_type: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True      # or orm_mode = True for Pydantic v1