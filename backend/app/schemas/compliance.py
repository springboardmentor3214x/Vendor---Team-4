from pydantic import BaseModel


# -----------------------------------
# Compliance Response
# -----------------------------------

class ComplianceResponse(BaseModel):

    vendor_id: int

    vendor_name: str

    contract_status: str

    certification_status: str

    document_status: str

    compliance_percentage: float

    overall_status: str


# -----------------------------------
# Compliance Summary
# -----------------------------------

class ComplianceSummary(BaseModel):

    total_vendors: int

    compliant_vendors: int

    non_compliant_vendors: int

    average_compliance: float