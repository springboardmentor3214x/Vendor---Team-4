from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


# -----------------------------
# Contract Status
# -----------------------------

class ContractStatus(str, Enum):

    ACTIVE = "Active"

    EXPIRED = "Expired"

    RENEWED = "Renewed"

    TERMINATED = "Terminated"


# -----------------------------
# Base Schema
# -----------------------------

class ContractBase(BaseModel):

    vendor_id: int

    contract_number: str

    contract_title: str

    contract_type: str

    start_date: date

    end_date: date

    contract_value: int

    description: Optional[str] = None

    document_path: Optional[str] = None


# -----------------------------
# Create Contract
# -----------------------------

class ContractCreate(ContractBase):

    pass


# -----------------------------
# Update Contract
# -----------------------------

class ContractUpdate(BaseModel):

    contract_title: Optional[str] = None

    contract_type: Optional[str] = None

    start_date: Optional[date] = None

    end_date: Optional[date] = None

    contract_value: Optional[int] = None

    status: Optional[ContractStatus] = None

    description: Optional[str] = None

    document_path: Optional[str] = None


# -----------------------------
# Response Schema
# -----------------------------

class ContractResponse(ContractBase):

    id: int

    status: ContractStatus

    created_at: datetime

    updated_at: datetime

    class Config:

        from_attributes = True