from datetime import date

from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.contract import Contract
from app.models.certification import Certification
from app.models.vendor_document import VendorDocument

from app.schemas.compliance import (
    ComplianceResponse,
    ComplianceSummary
)


# ---------------------------------------------------
# Get Compliance For All Vendors
# ---------------------------------------------------

def get_compliance(db: Session):
    """Build one current compliance summary per vendor from persisted records.

    Missing categories are reported as Pending rather than silently treated as
    compliant, and no synthetic records are created.
    """
    today = date.today()
    vendors = db.query(Vendor).order_by(Vendor.company_name.asc()).all()
    results = []

    for vendor in vendors:
        contracts = db.query(Contract).filter(Contract.vendor_id == vendor.id).all()
        certifications = db.query(Certification).filter(Certification.vendor_id == vendor.id).all()
        documents = db.query(VendorDocument).filter(VendorDocument.vendor_id == vendor.id).all()

        contract_status = "Pending" if not contracts else ("Non-Compliant" if any(c.end_date < today or str(c.status.value if hasattr(c.status, 'value') else c.status) == "Terminated" for c in contracts) else "Compliant")
        certification_status = "Pending" if not certifications else ("Non-Compliant" if any(c.expiry_date < today or str(c.status.value if hasattr(c.status, 'value') else c.status) == "Expired" for c in certifications) else "Compliant")
        document_status = "Pending" if not documents else ("Non-Compliant" if any(d.expiry_date and d.expiry_date < today or str(d.status.value if hasattr(d.status, 'value') else d.status) == "Expired" for d in documents) else "Compliant")

        statuses = [contract_status, certification_status, document_status]
        percentage = round(sum(100 if status == "Compliant" else 0 for status in statuses) / 3, 2)
        overall = "Compliant" if percentage == 100 else ("Pending" if any(status == "Pending" for status in statuses) else "Non-Compliant")

        results.append(ComplianceResponse(
            vendor_id=vendor.id,
            vendor_name=vendor.company_name,
            contract_status=contract_status,
            certification_status=certification_status,
            document_status=document_status,
            compliance_percentage=percentage,
            overall_status=overall
        ))

    return results


# ---------------------------------------------------
# Vendor Compliance
# ---------------------------------------------------

def get_vendor_compliance(
    db: Session,
    vendor_id: int
):

    compliance = get_compliance(db)

    for item in compliance:

        if item.vendor_id == vendor_id:

            return item

    return None


# ---------------------------------------------------
# Non-Compliant Vendors
# ---------------------------------------------------

def get_non_compliant_vendors(
    db: Session
):

    return [

        vendor

        for vendor in get_compliance(db)

        if vendor.overall_status == "Non-Compliant"

    ]


# ---------------------------------------------------
# Compliance Summary
# ---------------------------------------------------

def get_summary(
    db: Session
):

    compliance = get_compliance(db)

    total = len(compliance)

    compliant = len(

        [

            c

            for c in compliance

            if c.overall_status == "Compliant"

        ]

    )

    average = (

        sum(

            c.compliance_percentage

            for c in compliance

        ) / total

        if total

        else 0

    )

    return ComplianceSummary(

        total_vendors=total,

        compliant_vendors=compliant,

        non_compliant_vendors=(
            total - compliant
        ),

        average_compliance=round(
            average,
            2
        )

    )
# ---------------------------------------------------
# Expiring Contracts
# ---------------------------------------------------

def get_expiring_contracts(
    db: Session,
    days: int = 30
):

    from app.services.contract_service import (
        get_expiring_contracts
    )

    return get_expiring_contracts(
        db,
        days
    )


# ---------------------------------------------------
# Expiring Certifications
# ---------------------------------------------------

def get_expiring_certifications(
    db: Session,
    days: int = 30
):

    from app.services.certification_service import (
        get_expiring_certifications
    )

    return get_expiring_certifications(
        db,
        days
    )


# ---------------------------------------------------
# Expiring Vendor Documents
# ---------------------------------------------------

def get_expiring_documents(
    db: Session,
    days: int = 30
):

    from app.services.vendor_document_service import (
        get_expiring_documents
    )

    return get_expiring_documents(
        db,
        days
    )