from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.delivery_performance import (
    DeliveryPerformance,
    DeliveryStatus,
)
from app.models.product_quality import ProductQualityEvaluation
from app.models.communication_log import CommunicationLog
from app.models.service_rating import ServiceRating
from app.models.vendor_performance import VendorPerformance
from app.services.vendor_reliability_service import VendorReliabilityService

class VendorPerformanceService:

    @staticmethod
    def update_vendor_performance(
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

        total_orders = db.query(PurchaseOrder).filter(
            PurchaseOrder.vendor_id == vendor_id
        ).count()

        completed_orders = len(deliveries)

        delayed_delivery_count = len([
            d for d in deliveries
            if d.delivery_status == DeliveryStatus.DELAYED
        ])

        average_delay = (
            sum(d.delay_days for d in deliveries) / len(deliveries)
            if deliveries else 0
        )

        on_time_rate = (
            len([
                d for d in deliveries
                if d.delivery_status != DeliveryStatus.DELAYED
            ]) / len(deliveries) * 100
            if deliveries else 0
        )

        quality_score = (
            sum(
                (
                    q.material_quality +
                    q.packaging_quality +
                    q.quantity_accuracy +
                    q.specification_compliance +
                    (5 - q.product_defects)
                ) / 5
                for q in qualities
            ) / len(qualities)
            if qualities else 0
        )

        response_time = (
            sum(
                c.response_duration
                for c in communications
            ) / len(communications)
            if communications else 0
        )

        service_rating = (
            sum(
                s.overall_service_rating
                for s in services
            ) / len(services)
            if services else 0
        )

        completion_rate = (
            completed_orders / total_orders * 100
            if total_orders else 0
        )

        overall_score = round(
            (
                on_time_rate / 20
                + quality_score
                + service_rating
                + max(0, 5 - (response_time / 60))
            ) / 4,
            2
        )

        performance = db.query(
            VendorPerformance
        ).filter(
            VendorPerformance.vendor_id == vendor_id
        ).first()

        if performance is None:

            performance = VendorPerformance(
                vendor_id=vendor_id
            )

            db.add(performance)

        performance.on_time_delivery_rate = round(
            on_time_rate,
            2
        )

        performance.delayed_delivery_count = delayed_delivery_count

        performance.average_delivery_delay = round(
            average_delay,
            2
        )

        performance.average_quality_score = round(
            quality_score,
            2
        )

        performance.average_response_time = round(
            response_time,
            2
        )

        performance.average_service_rating = round(
            service_rating,
            2
        )

        performance.order_completion_rate = round(
            completion_rate,
            2
        )

        performance.overall_vendor_score = overall_score

        db.commit()
        db.refresh(performance)
        VendorReliabilityService.update_vendor_reliability(
            db,
            vendor_id
        )
        return performance
    @staticmethod
    def get_vendor_performance(
        db: Session,
        vendor_id: int
    ):
        return db.query(
            VendorPerformance
        ).filter(
            VendorPerformance.vendor_id == vendor_id
        ).first()
    @staticmethod
    def get_dashboard(
        db: Session
    ):
        return db.query(
            VendorPerformance
        ).all()
    @staticmethod
    def get_rankings(db: Session):

        performances = (
            db.query(VendorPerformance)
            .order_by(VendorPerformance.overall_vendor_score.desc())
            .all()
        )

        rankings = []

        for rank, performance in enumerate(performances, start=1):

            vendor = db.query(Vendor).filter(
                Vendor.id == performance.vendor_id
            ).first()

            rankings.append({
                "rank": rank,
                "vendor_id": performance.vendor_id,
                "vendor_name": vendor.company_name if vendor else "Unknown",
                "overall_vendor_score": performance.overall_vendor_score,
                "on_time_delivery_rate": performance.on_time_delivery_rate,
                "average_quality_score": performance.average_quality_score,
                "average_service_rating": performance.average_service_rating
            })

        return rankings
    @staticmethod
    def get_dashboard_summary(
        db: Session
    ):

        performances = db.query(VendorPerformance).all()

        if not performances:
            return {
                "total_vendors": 0,
                "total_completed_orders": 0,
                "delayed_deliveries": 0,
                "average_delivery_performance": 0,
                "average_quality_rating": 0,
                "average_response_time": 0,
                "average_vendor_score": 0,
                "best_vendor": None,
                "worst_vendor": None
            }

        total_vendors = len(performances)

        total_completed_orders = sum(
            p.order_completion_rate > 0
            for p in performances
        )

        delayed_deliveries = sum(
            p.delayed_delivery_count
            for p in performances
        )

        average_delivery = round(
            sum(
                p.on_time_delivery_rate
                for p in performances
            ) / total_vendors,
            2
        )

        average_quality = round(
            sum(
                p.average_quality_score
                for p in performances
            ) / total_vendors,
            2
        )

        average_response = round(
            sum(
                p.average_response_time
                for p in performances
            ) / total_vendors,
            2
        )

        average_score = round(
            sum(
                p.overall_vendor_score
                for p in performances
            ) / total_vendors,
            2
        )

        best = max(
            performances,
            key=lambda x: x.overall_vendor_score
        )

        worst = min(
            performances,
            key=lambda x: x.overall_vendor_score
        )

        best_vendor = db.query(Vendor).filter(
            Vendor.id == best.vendor_id
        ).first()

        worst_vendor = db.query(Vendor).filter(
            Vendor.id == worst.vendor_id
        ).first()

        return {
            "total_vendors": total_vendors,
            "total_completed_orders": total_completed_orders,
            "delayed_deliveries": delayed_deliveries,
            "average_delivery_performance": average_delivery,
            "average_quality_rating": average_quality,
            "average_response_time": average_response,
            "average_vendor_score": average_score,
            "best_vendor": best_vendor.company_name,
            "worst_vendor": worst_vendor.company_name
        }