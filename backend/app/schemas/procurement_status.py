from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel

class ProcurementStatusDashboard(BaseModel):
    total_requests: int
    pending: int
    approved: int
    rejected: int
    vendor_assigned: int
    purchase_order_created: int

class ProcurementStatusResponse(BaseModel):
    procurement_request_id: int
    procurement_request_number: str
    item_name: str
    vendor_name: Optional[str] = None
    request_status: str
    workflow_stage: str