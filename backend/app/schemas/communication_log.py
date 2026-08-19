from datetime import datetime
from pydantic import BaseModel

from app.models.communication_log import CommunicationStatus


class CommunicationLogCreate(BaseModel):
    purchase_order_id: int
    message_sent_time: datetime
    vendor_response_time: datetime
    remarks: str | None = None


class CommunicationLogResponse(BaseModel):
    id: int
    purchase_order_id: int
    vendor_id: int
    message_sent_time: datetime
    vendor_response_time: datetime
    response_duration: int
    communication_status: CommunicationStatus
    remarks: str | None = None

    class Config:
        from_attributes = True