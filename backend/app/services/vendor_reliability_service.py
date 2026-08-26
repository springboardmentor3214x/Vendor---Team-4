from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.vendor_reliability import VendorReliability
from app.models.vendor_reliability_history import VendorReliabilityHistory
from app.models.purchase_order import PurchaseOrder, PurchaseOrderStatus
from app.models.delivery_performance import DeliveryPerformance, DeliveryStatus
from app.models.product_quality import ProductQualityEvaluation
from app.models.communication_log import CommunicationLog
from app.models.service_rating import ServiceRating
from app.models.vendor_issue import VendorIssue


class VendorReliabilityService:

    @staticmethod
    def calculate_factors(db: Session, vendor_id: int):
        deliveries = db.query(DeliveryPerformance).filter(DeliveryPerformance.vendor_id == vendor_id).all()
        qualities = db.query(ProductQualityEvaluation).filter(ProductQualityEvaluation.vendor_id == vendor_id).all()
        communications = db.query(CommunicationLog).filter(CommunicationLog.vendor_id == vendor_id).all()
        services = db.query(ServiceRating).filter(ServiceRating.vendor_id == vendor_id).all()
        orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).all()
        issues = db.query(VendorIssue).filter(VendorIssue.vendor_id == vendor_id).all()

        delivery_score = (
            sum(1 for d in deliveries if d.delivery_status in (DeliveryStatus.ON_TIME, DeliveryStatus.EARLY))
            / len(deliveries) * 100
        ) if deliveries else 0

        quality_score = (
            sum({"EXCELLENT": 5, "GOOD": 4, "AVERAGE": 3, "POOR": 2}.get(q.overall_quality_rating.value, 0) for q in qualities)
            / len(qualities) * 20
        ) if qualities else 0

        communication_score = (
            max(0, min(100, 100 - (sum(max(0, c.response_duration or 0) for c in communications) / len(communications))))
            if communications else 0
        )

        service_score = (
            sum(s.overall_service_rating for s in services) / len(services) * 20
        ) if services else 0

        completed = sum(1 for o in orders if o.status == PurchaseOrderStatus.COMPLETED)
        purchase_history_score = (completed / len(orders) * 100) if orders else 0

        if not issues:
            issue_resolution_score = 100
        else:
            resolved = sum(1 for i in issues if str(i.status).lower() in {"resolved", "closed", "completed"})
            issue_resolution_score = resolved / len(issues) * 100

        return {
            "delivery_score": round(delivery_score, 2),
            "quality_score": round(quality_score, 2),
            "communication_score": round(communication_score, 2),
            "service_score": round(service_score, 2),
            "purchase_history_score": round(purchase_history_score, 2),
            "issue_resolution_score": round(issue_resolution_score, 2),
            "completed_orders": completed,
            "total_orders": len(orders),
        }

    @staticmethod
    def update_vendor_reliability(db: Session, vendor_id: int, record_history: bool = True):
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            return None

        factors = VendorReliabilityService.calculate_factors(db, vendor_id)

        weighted = []
        if deliveries_count := db.query(DeliveryPerformance).filter(DeliveryPerformance.vendor_id == vendor_id).count():
            weighted.append((factors["delivery_score"], 0.25))
        if qualities_count := db.query(ProductQualityEvaluation).filter(ProductQualityEvaluation.vendor_id == vendor_id).count():
            weighted.append((factors["quality_score"], 0.20))
        if communications_count := db.query(CommunicationLog).filter(CommunicationLog.vendor_id == vendor_id).count():
            weighted.append((factors["communication_score"], 0.15))
        if services_count := db.query(ServiceRating).filter(ServiceRating.vendor_id == vendor_id).count():
            weighted.append((factors["service_score"], 0.15))
        if factors["total_orders"]:
            weighted.append((factors["purchase_history_score"], 0.20))
        if issues_count := db.query(VendorIssue).filter(VendorIssue.vendor_id == vendor_id).count():
            weighted.append((factors["issue_resolution_score"], 0.05))

        reliability_score = round(
            sum(score * weight for score, weight in weighted) / sum(weight for _, weight in weighted), 2
        ) if weighted else 0

        if reliability_score >= 90:
            risk, recommendation = "Low Risk", "Highly Recommended"
        elif reliability_score >= 60:
            risk, recommendation = "Medium Risk", "Recommended"
        else:
            risk, recommendation = "High Risk", "Not Recommended"

        reliability = db.query(VendorReliability).filter(VendorReliability.vendor_id == vendor_id).first()
        if reliability is None:
            reliability = VendorReliability(vendor_id=vendor_id)
            db.add(reliability)

        reliability.reliability_score = reliability_score
        reliability.risk_level = risk
        reliability.recommendation = recommendation
        reliability.last_calculated = datetime.utcnow()
        db.commit()
        db.refresh(reliability)

        if record_history:
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
    def refresh_all(db: Session):
        vendors = db.query(Vendor).order_by(Vendor.company_name.asc()).all()
        return [VendorReliabilityService.update_vendor_reliability(db, v.id, record_history=False) for v in vendors]

    @staticmethod
    def get_vendor_reliability(db: Session, vendor_id: int):
        reliability = VendorReliabilityService.update_vendor_reliability(db, vendor_id, record_history=False)
        if not reliability:
            raise HTTPException(status_code=404, detail="Vendor not found.")
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        factors = VendorReliabilityService.calculate_factors(db, vendor_id)
        return {
            "vendor_id": vendor_id,
            "vendor_name": vendor.company_name if vendor else "Unknown",
            "reliability_score": reliability.reliability_score,
            "risk_level": reliability.risk_level,
            "recommendation": reliability.recommendation,
            "last_calculated": reliability.last_calculated,
            **factors,
        }

    @staticmethod
    def get_rankings(db: Session):
        reliabilities = VendorReliabilityService.refresh_all(db)
        rows = []
        for reliability in reliabilities:
            vendor = db.query(Vendor).filter(Vendor.id == reliability.vendor_id).first()
            if not vendor:
                continue
            rows.append({
                "rank": 0,
                "vendor_id": vendor.id,
                "vendor_name": vendor.company_name,
                "vendor_category": vendor.vendor_category.value if vendor.vendor_category else "",
                "reliability_score": reliability.reliability_score or 0,
                "risk_level": reliability.risk_level,
                "recommendation": reliability.recommendation,
            })
        rows.sort(key=lambda x: x["reliability_score"], reverse=True)
        for index, row in enumerate(rows, start=1):
            row["rank"] = index
        return rows

    @staticmethod
    def get_dashboard(db: Session):
        reliabilities = VendorReliabilityService.refresh_all(db)
        if not reliabilities:
            return {"total_vendors": 0, "average_reliability_score": 0, "high_reliability_vendors": 0, "medium_reliability_vendors": 0, "high_risk_vendors": 0, "top_vendor": None, "recommended_vendors": 0}

        top = max(reliabilities, key=lambda r: r.reliability_score or 0)
        top_vendor = db.query(Vendor).filter(Vendor.id == top.vendor_id).first()
        return {
            "total_vendors": len(reliabilities),
            "average_reliability_score": round(sum(r.reliability_score or 0 for r in reliabilities) / len(reliabilities), 2),
            "high_reliability_vendors": sum((r.reliability_score or 0) >= 90 for r in reliabilities),
            "medium_reliability_vendors": sum(60 <= (r.reliability_score or 0) < 90 for r in reliabilities),
            "high_risk_vendors": sum(r.risk_level == "High Risk" for r in reliabilities),
            "top_vendor": top_vendor.company_name if top_vendor else None,
            "recommended_vendors": sum(r.recommendation != "Not Recommended" for r in reliabilities)
        }

    @staticmethod
    def get_vendor_history(db: Session, vendor_id: int):
        history = db.query(VendorReliabilityHistory).filter(
            VendorReliabilityHistory.vendor_id == vendor_id
        ).order_by(VendorReliabilityHistory.calculated_at.desc()).all()
        return history
