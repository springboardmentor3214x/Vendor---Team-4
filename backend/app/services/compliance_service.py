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

    vendors = db.query(Vendor).all()

    results = []

    for vendor in vendors:

        contracts = (
            db.query(Contract)
            .filter(Contract.vendor_id == vendor.id)
            .all()
        )

        certifications = (
            db.query(Certification)
            .filter(Certification.vendor_id == vendor.id)
            .all()
        )

        documents = (
            db.query(VendorDocument)
            .filter(VendorDocument.vendor_id == vendor.id)
            .all()
        )

        contract_ok = all(
            c.end_date >= date.today()
            for c in contracts
        ) if contracts else False

        certification_ok = all(
            c.expiry_date >= date.today()
            for c in certifications
        ) if certifications else False

        document_ok = all(
            d.expiry_date is None or d.expiry_date >= date.today()
            for d in documents
        ) if documents else False

        score = (
            int(contract_ok)
            + int(certification_ok)
            + int(document_ok)
        )

        percentage = round(
            score / 3 * 100,
            2
        )

        results.append(

            ComplianceResponse(

                vendor_id=vendor.id,

                vendor_name=vendor.company_name,

                contract_status=(
                    "Compliant"
                    if contract_ok
                    else "Non-Compliant"
                ),

                certification_status=(
                    "Compliant"
                    if certification_ok
                    else "Non-Compliant"
                ),

                document_status=(
                    "Compliant"
                    if document_ok
                    else "Non-Compliant"
                ),

                compliance_percentage=percentage,

                overall_status=(
                    "Compliant"
                    if percentage >= 80
                    else "Non-Compliant"
                )
            )

        )

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