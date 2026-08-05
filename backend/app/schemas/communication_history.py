from datetime import datetime
from pydantic import BaseModel


class CommunicationHistoryResponse(BaseModel):

    type: str

    reference_id: int

    purchase_order_id: int | None

    user_id: int

    title: str

    description: str

    created_at: datetime