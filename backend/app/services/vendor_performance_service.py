from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder, PurchaseOrderStatus
from app.models.delivery_performance import DeliveryPerformance, DeliveryStatus
from app.models.product_quality import ProductQualityEvaluation
from app.models.communication_log import CommunicationLog
from app.models.service_rating import ServiceRating
from app.models.vendor_performance import VendorPerformance
from app.services.vendor_reliability_service import VendorReliabilityService


class VendorPerformanceService:

    @staticmethod
    def update_vendor_performance(db: Session, vendor_id: int, update_reliability: bool = True):
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            return None

        deliveries = db.query(DeliveryPerformance).filter(DeliveryPerformance.vendor_id == vendor_id).all()
        qualities = db.query(ProductQualityEvaluation).filter(ProductQualityEvaluation.vendor_id == vendor_id).all()
        communications = db.query(CommunicationLog).filter(CommunicationLog.vendor_id == vendor_id).all()
        services = db.query(ServiceRating).filter(ServiceRating.vendor_id == vendor_id).all()

        total_orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).count()
        completed_orders = db.query(PurchaseOrder).filter(
            PurchaseOrder.vendor_id == vendor_id,
            PurchaseOrder.status == PurchaseOrderStatus.COMPLETED
        ).count()

        delayed_delivery_count = sum(1 for d in deliveries if d.delivery_status == DeliveryStatus.DELAYED)
        average_delay = (sum(max(0, d.delay_days or 0) for d in deliveries) / len(deliveries)) if deliveries else 0
        on_time_rate = (
            sum(1 for d in deliveries if d.delivery_status in (DeliveryStatus.ON_TIME, DeliveryStatus.EARLY))
            / len(deliveries) * 100
        ) if deliveries else 0

        quality_score = (
            sum((q.material_quality + q.packaging_quality + q.quantity_accuracy +
                 q.specification_compliance + max(0, 5 - q.product_defects)) / 5 for q in qualities)
            / len(qualities)
        ) if qualities else 0

        response_time = (
            sum(max(0, c.response_duration or 0) for c in communications) / len(communications)
        ) if communications else 0

        service_rating = (
            sum(s.overall_service_rating for s in services) / len(services)
        ) if services else 0

        completion_rate = (completed_orders / total_orders * 100) if total_orders else 0

        # Use every available business signal. Purchase-order completion is a real
        # performance signal, so a vendor with orders is not incorrectly shown as 0
        # merely because a separate evaluation record has not yet been entered.
        weighted = []
        if deliveries:
            weighted.append((on_time_rate, 0.25))
        if qualities:
            weighted.append((quality_score * 20, 0.25))
        if communications:
            weighted.append((max(0, min(100, 100 - response_time)), 0.15))
        if services:
            weighted.append((service_rating * 20, 0.15))
        if total_orders:
            weighted.append((completion_rate, 0.20))

        overall_score = (
            round(sum(score * weight for score, weight in weighted) / sum(weight for _, weight in weighted), 2)
            if weighted else 0
        )

        performance = db.query(VendorPerformance).filter(VendorPerformance.vendor_id == vendor_id).first()
        if performance is None:
            performance = VendorPerformance(vendor_id=vendor_id)
            db.add(performance)

        performance.on_time_delivery_rate = round(on_time_rate, 2)
        performance.delayed_delivery_count = delayed_delivery_count
        performance.average_delivery_delay = round(average_delay, 2)
        performance.average_quality_score = round(quality_score, 2)
        performance.average_response_time = round(response_time, 2)
        performance.average_service_rating = round(service_rating, 2)
        performance.order_completion_rate = round(completion_rate, 2)
        performance.overall_vendor_score = overall_score

        db.commit()
        db.refresh(performance)

        if update_reliability:
            VendorReliabilityService.update_vendor_reliability(db, vendor_id, record_history=True)

        return performance

    @staticmethod
    def refresh_all(db: Session):
        vendors = db.query(Vendor).order_by(Vendor.company_name.asc()).all()
        results = []
        for vendor in vendors:
            performance = VendorPerformanceService.update_vendor_performance(
                db, vendor.id, update_reliability=False
            )
            results.append(performance)
        return results

    @staticmethod
    def get_vendor_performance(db: Session, vendor_id: int):
        return VendorPerformanceService.update_vendor_performance(db, vendor_id, update_reliability=False)

    @staticmethod
    def get_dashboard(db: Session):
        return VendorPerformanceService.refresh_all(db)

    @staticmethod
    def get_rankings(db: Session):
        performances = VendorPerformanceService.refresh_all(db)
        rows = []
        for performance in performances:
            vendor = db.query(Vendor).filter(Vendor.id == performance.vendor_id).first()
            if not vendor:
                continue
            rows.append({
                "vendor_id": vendor.id,
                "vendor_name": vendor.company_name,
                "vendor_category": vendor.vendor_category.value if vendor.vendor_category else None,
                "overall_vendor_score": performance.overall_vendor_score or 0,
                "on_time_delivery_rate": performance.on_time_delivery_rate or 0,
                "average_quality_score": performance.average_quality_score or 0,
                "average_service_rating": performance.average_service_rating or 0,
                "average_response_time": performance.average_response_time or 0,
                "delayed_delivery_count": performance.delayed_delivery_count or 0,
                "order_completion_rate": performance.order_completion_rate or 0,
            })
        rows.sort(key=lambda x: x["overall_vendor_score"], reverse=True)
        for index, row in enumerate(rows, start=1):
            row["rank"] = index
        return rows

    @staticmethod
    def get_dashboard_summary(db: Session):
        performances = VendorPerformanceService.refresh_all(db)
        if not performances:
            return {
                "total_vendors": 0, "total_completed_orders": 0, "delayed_deliveries": 0,
                "average_delivery_performance": 0, "average_quality_rating": 0,
                "average_response_time": 0, "average_vendor_score": 0,
                "best_vendor": None, "worst_vendor": None
            }

        total_vendors = len(performances)
        total_completed_orders = db.query(PurchaseOrder).filter(
            PurchaseOrder.status == PurchaseOrderStatus.COMPLETED
        ).count()
        delayed_deliveries = sum(p.delayed_delivery_count or 0 for p in performances)

        best = max(performances, key=lambda x: x.overall_vendor_score or 0)
        worst = min(performances, key=lambda x: x.overall_vendor_score or 0)
        best_vendor = db.query(Vendor).filter(Vendor.id == best.vendor_id).first()
        worst_vendor = db.query(Vendor).filter(Vendor.id == worst.vendor_id).first()

        return {
            "total_vendors": total_vendors,
            "total_completed_orders": total_completed_orders,
            "delayed_deliveries": delayed_deliveries,
            "average_delivery_performance": round(sum(p.on_time_delivery_rate or 0 for p in performances) / total_vendors, 2),
            "average_quality_rating": round(sum(p.average_quality_score or 0 for p in performances) / total_vendors, 2),
            "average_response_time": round(sum(p.average_response_time or 0 for p in performances) / total_vendors, 2),
            "average_vendor_score": round(sum(p.overall_vendor_score or 0 for p in performances) / total_vendors, 2),
            "best_vendor": best_vendor.company_name if best_vendor else None,
            "worst_vendor": worst_vendor.company_name if worst_vendor else None
        }
