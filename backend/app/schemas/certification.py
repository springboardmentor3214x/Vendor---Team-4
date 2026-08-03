from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


# -----------------------------------
# Certification Status
# -----------------------------------

class CertificationStatus(str, Enum):

    VALID = "Valid"

    EXPIRED = "Expired"

    PENDING = "Pending"


# -----------------------------------
# Base Schema
# -----------------------------------

class CertificationBase(BaseModel):

    vendor_id: int

    certification_name: str

    certification_number: str

    issuing_authority: str

    issue_date: date

    expiry_date: date

    document_path: Optional[str] = None


# -----------------------------------
# Create Certification
# -----------------------------------

class CertificationCreate(CertificationBase):

    pass


# -----------------------------------
# Update Certification
# -----------------------------------

class CertificationUpdate(BaseModel):

    certification_name: Optional[str] = None

    certification_number: Optional[str] = None

    issuing_authority: Optional[str] = None

    issue_date: Optional[date] = None

    expiry_date: Optional[date] = None

    status: Optional[CertificationStatus] = None

    document_path: Optional[str] = None


# -----------------------------------
# Response Schema
# -----------------------------------

class CertificationResponse(CertificationBase):

    id: int

    status: CertificationStatus

    created_at: datetime

    updated_at: datetime

    class Config:

        from_attributes = True