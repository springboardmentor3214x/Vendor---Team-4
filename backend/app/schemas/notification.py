from pydantic import BaseModel


class NotificationResponse(BaseModel):

    notification_type: str

    vendor_id: int

    vendor_name: str

    item_name: str

    expiry_date: str

    days_remaining: int


class NotificationSummary(BaseModel):

    total_notifications: int

    contract_notifications: int

    certification_notifications: int

    document_notifications: int