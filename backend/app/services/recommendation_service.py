from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.vendor_reliability import VendorReliability


class RecommendationService:

    @staticmethod
    def get_recommendation(db: Session, vendor_id: int):

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

        score = reliability.reliability_score

        if score >= 90:
            recommendation = "Preferred Vendor"

        elif score >= 75:
            recommendation = "Recommended"

        elif score >= 60:
            recommendation = "Use with Monitoring"

        else:
            recommendation = "Do Not Recommend"

        return {
            "vendor": vendor.company_name,
            "reliability_score": score,
            "recommendation": recommendation
        }