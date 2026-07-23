from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.vendor_reliability import VendorReliability


class HighRiskWarningService:

    @staticmethod
    def get_warning(db: Session, vendor_id: int):

        vendor = db.query(Vendor).filter(
            Vendor.id == vendor_id
        ).first()

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found."
            )

        reliability = db.query(VendorReliability).filter(
            VendorReliability.vendor_id == vendor_id
        ).first()

        if not reliability:
            raise HTTPException(
                status_code=404,
                detail="Reliability data not found."
            )

        warning = reliability.reliability_score < 60

        return {
            "vendor": vendor.company_name,
            "reliability_score": reliability.reliability_score,
            "risk_level": reliability.risk_level,
            "warning": warning,
            "message": (
                "⚠️ High Risk Vendor. Procurement is not recommended."
                if warning
                else "Vendor is safe for procurement."
            )
        }