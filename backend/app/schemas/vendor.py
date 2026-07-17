from typing import Optional
from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    Field
)

from app.models.vendor import (
    VendorCategory,
    VendorStatus,
    ApprovalStatus
)


# -----------------------------
# Create Vendor
# -----------------------------
class VendorCreate(BaseModel):

    company_name: str = Field(min_length=2)

    vendor_category: VendorCategory

    contact_person: str = Field(min_length=2)

    designation: str = Field(min_length=2)

    email: EmailStr

    phone: str = Field(
        pattern=r"^[0-9]{10}$"
    )

    alternate_phone: Optional[str] = None

    gst_number: str

    pan_number: str

    company_registration_number: str

    address_line1: str

    address_line2: Optional[str] = None

    city: str

    state: str

    country: str

    pincode: str

    website: Optional[str] = None

    description: Optional[str] = None

    bank_account_number: Optional[str] = None

    ifsc_code: Optional[str] = None

    payment_terms: Optional[str] = None
class VendorUpdate(BaseModel):

    company_name: Optional[str] = None

    vendor_category: Optional[VendorCategory] = None

    contact_person: Optional[str] = None

    designation: Optional[str] = None

    email: Optional[EmailStr] = None

    phone: Optional[str] = Field(
        default=None,
        pattern=r"^[0-9]{10}$"
    )

    alternate_phone: Optional[str] = None

    gst_number: Optional[str] = None

    pan_number: Optional[str] = None

    company_registration_number: Optional[str] = None

    address_line1: Optional[str] = None

    address_line2: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    country: Optional[str] = None

    pincode: Optional[str] = None

    website: Optional[str] = None

    description: Optional[str] = None

    bank_account_number: Optional[str] = None

    ifsc_code: Optional[str] = None

    payment_terms: Optional[str] = None

    vendor_status: Optional[VendorStatus] = None
class VendorResponse(BaseModel):

    id: int

    vendor_id: str

    company_name: str

    vendor_category: VendorCategory

    contact_person: str

    designation: str

    email: str

    phone: str

    alternate_phone: Optional[str]

    gst_number: str

    pan_number: str

    company_registration_number: str

    address_line1: str

    address_line2: Optional[str]

    city: str

    state: str

    country: str

    pincode: str

    website: Optional[str]

    description: Optional[str]

    bank_account_number: Optional[str]

    ifsc_code: Optional[str]

    payment_terms: Optional[str]

    vendor_status: VendorStatus

    approval_status: ApprovalStatus

    created_at: datetime

    class Config:
        from_attributes = True
class VendorApproval(BaseModel):

    approval_status: ApprovalStatus