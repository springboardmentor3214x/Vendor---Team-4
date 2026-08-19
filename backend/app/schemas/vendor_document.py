from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


# -----------------------------------
# Document Status
# -----------------------------------

class DocumentStatus(str, Enum):

    VALID = "Valid"

    EXPIRED = "Expired"

    PENDING = "Pending"


# -----------------------------------
# Base Schema
# -----------------------------------

class VendorDocumentBase(BaseModel):

    vendor_id: int

    document_type: str

    file_name: str

    file_path: str

    file_size: Optional[int] = None

    file_type: Optional[str] = None

    uploaded_by: int

    expiry_date: Optional[date] = None


# -----------------------------------
# Create
# -----------------------------------

class VendorDocumentCreate(
    VendorDocumentBase
):

    pass


# -----------------------------------
# Update
# -----------------------------------

class VendorDocumentUpdate(BaseModel):

    document_type: Optional[str] = None

    file_name: Optional[str] = None

    file_path: Optional[str] = None

    file_size: Optional[int] = None

    file_type: Optional[str] = None

    expiry_date: Optional[date] = None

    status: Optional[
        DocumentStatus
    ] = None


# -----------------------------------
# Response
# -----------------------------------

class VendorDocumentResponse(
    VendorDocumentBase
):

    id: int

    uploaded_at: datetime

    status: DocumentStatus

    class Config:

        from_attributes = True