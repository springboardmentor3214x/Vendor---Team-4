from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.vendor_reliability import VendorReliability
from app.models.vendor_reliability_history import VendorReliabilityHistory

from app.models.delivery_performance import DeliveryPerformance
from app.models.product_quality import ProductQualityEvaluation
from app.models.communication_log import CommunicationLog
from app.models.service_rating import ServiceRating


class VendorReliabilityService:

    @staticmethod
    def update_vendor_reliability(
        db: Session,
        vendor_id: int
    ):

        vendor = db.query(Vendor).filter(
            Vendor.id == vendor_id
        ).first()

        if not vendor:
            return None

        deliveries = db.query(DeliveryPerformance).filter(
            DeliveryPerformance.vendor_id == vendor_id
        ).all()

        qualities = db.query(ProductQualityEvaluation).filter(
            ProductQualityEvaluation.vendor_id == vendor_id
        ).all()

        communications = db.query(CommunicationLog).filter(
            CommunicationLog.vendor_id == vendor_id
        ).all()

        services = db.query(ServiceRating).filter(
            ServiceRating.vendor_id == vendor_id
        ).all()

        delivery_score = 0

        if deliveries:
            on_time = len([
                d for d in deliveries
                if d.delivery_status.value in [
                    "ON_TIME",
                    "EARLY"
                ]
            ])

            delivery_score = (
                on_time / len(deliveries)
            ) * 100

        quality_score = 0

        if qualities:

            mapping = {
                "EXCELLENT": 5,
                "GOOD": 4,
                "AVERAGE": 3,
                "POOR": 2
            }

            quality_score = (
                sum(
                    mapping[q.overall_quality_rating.value]
                    for q in qualities
                )
                / len(qualities)
            ) * 20

        communication_score = 100

        if communications:

            avg = (
                sum(
                    c.response_duration
                    for c in communications
                )
                / len(communications)
            )

            communication_score = max(
                0,
                100 - avg
            )

        service_score = 0

        if services:

            service_score = (
                sum(
                    s.overall_service_rating
                    for s in services
                )
                / len(services)
            ) * 20

        reliability_score = round(

            (
                delivery_score * 0.30
                + quality_score * 0.30
                + communication_score * 0.20
                + service_score * 0.20
            ),

            2

        )

        if reliability_score >= 90:
            risk = "Low Risk"
            recommendation = "Highly Recommended"

        elif reliability_score >= 60:
            risk = "Medium Risk"
            recommendation = "Recommended"

        else:
            risk = "High Risk"
            recommendation = "Not Recommended"

        reliability = db.query(
            VendorReliability
        ).filter(
            VendorReliability.vendor_id == vendor_id
        ).first()

        if reliability is None:

            reliability = VendorReliability(
                vendor_id=vendor_id
            )

            db.add(reliability)

        reliability.reliability_score = reliability_score
        reliability.risk_level = risk
        reliability.recommendation = recommendation
        reliability.last_calculated = datetime.utcnow()

        db.commit()
        db.refresh(reliability)
        history = VendorReliabilityHistory(
            vendor_id=vendor_id,
            reliability_score=reliability.reliability_score,
            risk_level=reliability.risk_level,
            recommendation=reliability.recommendation
        )

        db.add(history)
        db.commit()

        return reliability
    @staticmethod
    def get_vendor_reliability(
        db: Session,
        vendor_id: int
    ):
        reliability = (
            db.query(VendorReliability)
            .filter(VendorReliability.vendor_id == vendor_id)
            .first()
        )

        if not reliability:
            raise HTTPException(
                status_code=404,
                detail="Vendor reliability not found."
            )

        vendor = (
            db.query(Vendor)
            .filter(Vendor.id == vendor_id)
            .first()
        )

        return {
            "vendor_id": reliability.vendor_id,
            "vendor_name": vendor.company_name if vendor else "Unknown",
            "reliability_score": reliability.reliability_score,
            "risk_level": reliability.risk_level,
            "recommendation": reliability.recommendation,
            "last_calculated": reliability.last_calculated
        }
    @staticmethod
    def get_rankings(
        db: Session
    ):

        reliabilities = (
            db.query(VendorReliability)
            .order_by(VendorReliability.reliability_score.desc())
            .all()
        )

        rankings = []

        for rank, reliability in enumerate(reliabilities, start=1):

            vendor = db.query(Vendor).filter(
                Vendor.id == reliability.vendor_id
            ).first()

            rankings.append({
                "rank": rank,
                "vendor_id": reliability.vendor_id,
                "vendor_name": vendor.company_name if vendor else "Unknown",
                "reliability_score": reliability.reliability_score,
                "risk_level": reliability.risk_level,
                "recommendation": reliability.recommendation
            })

        return rankings
    @staticmethod
    def get_dashboard(
        db: Session
    ):

        reliabilities = db.query(VendorReliability).all()

        if not reliabilities:
            return {
                "total_vendors": 0,
                "average_reliability_score": 0,
                "low_risk_vendors": 0,
                "medium_risk_vendors": 0,
                "high_risk_vendors": 0
            }

        return {
            "total_vendors": len(reliabilities),
            "average_reliability_score": round(
                sum(r.reliability_score for r in reliabilities) /
                len(reliabilities),
                2
            ),
            "low_risk_vendors": sum(
                r.risk_level == "Low Risk"
                for r in reliabilities
            ),
            "medium_risk_vendors": sum(
                r.risk_level == "Medium Risk"
                for r in reliabilities
            ),
            "high_risk_vendors": sum(
                r.risk_level == "High Risk"
                for r in reliabilities
            )
        }
    @staticmethod
    def get_vendor_history(db: Session, vendor_id: int):
        history = (
            db.query(VendorReliabilityHistory)
            .filter(VendorReliabilityHistory.vendor_id == vendor_id)
            .order_by(VendorReliabilityHistory.calculated_at.desc())
            .all()
        )

        if not history:
            raise HTTPException(
                status_code=404,
                detail="No reliability history found for this vendor."
            )

        return history