from datetime import datetime
from pydantic import BaseModel


class CommunicationHistoryResponse(BaseModel):
    type: str
    reference_id: int
    purchase_order_id: int | None
    vendor_id: int | None = None
    user_id: int
    title: str
    description: str
    status: str | None = None
    created_at: datetime
