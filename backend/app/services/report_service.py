from sqlalchemy.orm import Session
from datetime import date,datetime, timedelta
from collections import Counter
from app.models.vendor import Vendor, VendorCategory, VendorStatus
from app.models.purchase_order import PurchaseOrder
from app.models.vendor_performance import VendorPerformance
from app.models.contract import Contract, ContractStatus
from app.models.vendor_reliability import VendorReliability

from app.models.procurement_request import (
    ProcurementRequest,
    ProcurementStatus
)
from app.models.purchase_order import PurchaseOrder
from app.models.purchase_order import PurchaseOrderStatus

from app.models.vendor import Vendor, VendorCategory
from app.services.compliance_service import get_compliance
class ReportService:

    @staticmethod
    def get_vendor_performance_report(
        db: Session,
        vendor_category: str = None,
        vendor_name: str = None,
        sort_by: str = None,
        sort_order: str = "desc"
    ):

        query = db.query(Vendor)

        # Filter by vendor category
        if vendor_category:
            category_value = vendor_category.strip().upper()

            valid_categories = {
                item.value.upper(): item.value
                for item in VendorCategory
            }

            if category_value in valid_categories:
                actual_category = valid_categories[category_value]

                query = query.filter(
                    Vendor.vendor_category == actual_category
                )
            else:
                return {
                    "report_type": "Vendor Performance Report",
                    "total_vendors": 0,
                    "vendors": [],
                    "message": (
                        f"Invalid vendor category '{vendor_category}'. "
                        f"Valid values are: "
                        f"{', '.join(item.value for item in VendorCategory)}"
                    )
                }

        # Filter by vendor name
        if vendor_name:
            query = query.filter(
                Vendor.company_name.ilike(
                    f"%{vendor_name}%"
                )
            )

        vendors = query.all()

        report = []

        for vendor in vendors:

            performance = db.query(
                VendorPerformance
            ).filter(
                VendorPerformance.vendor_id == vendor.id
            ).first()

            completed_orders = db.query(
                PurchaseOrder
            ).filter(
                PurchaseOrder.vendor_id == vendor.id
            ).count()

            report.append({
                "vendor_id": vendor.id,
                "vendor_name": vendor.company_name,
                "vendor_category": vendor.vendor_category.value,

                "total_purchase_orders_completed":
                    completed_orders,

                "on_time_delivery_percentage":
                    performance.on_time_delivery_rate
                    if performance else 0,

                "delayed_deliveries":
                    performance.delayed_delivery_count
                    if performance else 0,

                "quality_rating":
                    performance.average_quality_score
                    if performance else 0,

                "communication_response_time":
                    performance.average_response_time
                    if performance else 0,

                "issue_resolution_performance":
                    performance.order_completion_rate
                    if performance else 0,

                "overall_service_rating":
                    performance.average_service_rating
                    if performance else 0,

                "vendor_reliability_score":
                    performance.overall_vendor_score
                    if performance else 0
            })
        # Sorting
        if sort_by:
            allowed_sort_fields = {
                "po_number": "po_number",
                "vendor_name": "vendor_name",
                "vendor_category": "vendor_category",
                "department_name": "department_name",
                "order_value": "order_value",
                "status": "status",
                "invoice_status": "invoice_status",
                "purchase_date": "purchase_date",
                "expected_delivery_date": "expected_delivery_date"
            }

            sort_field = allowed_sort_fields.get(
                sort_by.strip().lower()
            )

            if sort_field:
                reverse = (
                    sort_order.strip().lower() == "desc"
                )

                report.sort(
                    key=lambda item: (
                        item.get(sort_field) is None,
                        item.get(sort_field)
                    ),
                    reverse=reverse
                )
        return {
            "report_type": "Vendor Performance Report",
            "total_vendors": len(report),
            "vendors": report
        }
    @staticmethod
    def get_procurement_report(
        db: Session,
        department_name: str = None,
        start_date: str = None,
        end_date: str = None
    ):

        # -----------------------------
        # Procurement Requests
        # -----------------------------
        request_query = db.query(ProcurementRequest)

        if department_name:
            request_query = request_query.filter(
                ProcurementRequest.department_name.ilike(
                    f"%{department_name}%"
                )
            )

        if start_date:
            request_query = request_query.filter(
                ProcurementRequest.created_at >= start_date
            )

        if end_date:
            request_query = request_query.filter(
                ProcurementRequest.created_at <= end_date
            )

        requests = request_query.all()

        # -----------------------------
        # Basic statistics
        # -----------------------------
        total_requests = len(requests)

        approved_requests = sum(
            1 for request in requests
            if request.request_status == ProcurementStatus.APPROVED
        )

        completed_procurements = sum(
            1 for request in requests
            if request.request_status == ProcurementStatus.COMPLETED
        )

        # -----------------------------
        # Purchase Orders
        # -----------------------------
        po_query = db.query(PurchaseOrder)

        if start_date:
            po_query = po_query.filter(
                PurchaseOrder.purchase_order_date >= start_date
            )

        if end_date:
            po_query = po_query.filter(
                PurchaseOrder.purchase_order_date <= end_date
            )

        purchase_orders = po_query.all()

        total_purchase_orders = len(purchase_orders)

        total_expenditure = sum(
            po.total_cost or 0
            for po in purchase_orders
        )

        # -----------------------------
        # Department-wise requests
        # -----------------------------
        department_wise = {}

        for request in requests:
            department = request.department_name

            if department not in department_wise:
                department_wise[department] = 0

            department_wise[department] += 1

        return {
            "report_type": "Procurement Report",
            "total_procurement_requests": total_requests,
            "approved_requests": approved_requests,
            "total_purchase_orders": total_purchase_orders,
            "completed_procurements": completed_procurements,
            "total_expenditure": total_expenditure,
            "department_wise_requests": department_wise
        }
    @staticmethod
    def get_purchase_order_report(
        db: Session,
        vendor_name: str = None,
        category: str = None,
        department_name: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None,
        sort_by: str = None,
        sort_order: str = "desc"
    ):

        query = db.query(PurchaseOrder)

        # Date filters
        if start_date:
            query = query.filter(
                PurchaseOrder.purchase_order_date >= start_date
            )

        if end_date:
            query = query.filter(
                PurchaseOrder.purchase_order_date <= end_date
            )

        # Vendor filter
        if vendor_name:
            query = query.join(PurchaseOrder.vendor).filter(
                PurchaseOrder.vendor.has(
                    Vendor.company_name.ilike(f"%{vendor_name}%")
                )
            )

        # Category filter
        # Category filter - case insensitive
        if category:
            category_value = category.strip().upper()

            valid_categories = {
                item.value.upper(): item.value
                for item in VendorCategory
            }

            if category_value in valid_categories:
                actual_category = valid_categories[category_value]

                query = query.join(PurchaseOrder.vendor).filter(
                    Vendor.vendor_category == actual_category
                )
            else:
                return {
                    "report_type": "Purchase Order Report",
                    "total_purchase_orders": 0,
                    "purchase_orders": [],
                    "message": (
                        f"Invalid vendor category '{category}'. "
                        f"Valid values are: "
                        f"{', '.join(item.value for item in VendorCategory)}"
                    )
                }

        # Department filter
        if department_name:
            query = query.join(
                PurchaseOrder.procurement_request
            ).filter(
                ProcurementRequest.department_name.ilike(
                    f"%{department_name}%"
                )
            )

        # PO status filter
        # PO status filter - case insensitive
        if status:
            status_value = status.strip().upper()

            valid_statuses = {
                "PENDING",
                "GENERATED",
                "SENT",
                "COMPLETED",
                "CANCELLED"
            }

            if status_value in valid_statuses:
                query = query.filter(
                    PurchaseOrder.status == status_value
                )
            else:
                return {
                    "report_type": "Purchase Order Report",
                    "total_purchase_orders": 0,
                    "purchase_orders": [],
                    "message": (
                        f"Invalid status '{status}'. "
                        f"Valid values are: "
                        f"{', '.join(sorted(valid_statuses))}"
                    )
                }

        purchase_orders = query.all()

        report = []

        for po in purchase_orders:

            vendor = po.vendor
            procurement = po.procurement_request

            # Invoice status
            invoice_status = None

            if po.invoices:
                invoice_status = po.invoices[0].status.value

            report.append({
                "po_number": po.po_number,
                "vendor_name": (
                    vendor.company_name
                    if vendor else None
                ),
                "vendor_category": (
                    vendor.vendor_category.value
                    if vendor and vendor.vendor_category
                    else None
                ),
                "department_name": (
                    procurement.department_name
                    if procurement else None
                ),
                "purchase_date": po.purchase_order_date,
                "expected_delivery_date": (
                    po.expected_delivery_date
                ),
                "order_value": po.total_cost,
                "status": (
                    po.status.value
                    if po.status else None
                ),
                "invoice_status": invoice_status,
                "completion_date": (
                    po.updated_at.date()
                    if po.status == PurchaseOrderStatus.COMPLETED
                    and po.updated_at
                    else None
                )
            })
                # Sorting
        if sort_by:
            allowed_sort_fields = {
                "po_number": "po_number",
                "vendor_name": "vendor_name",
                "vendor_category": "vendor_category",
                "department_name": "department_name",
                "order_value": "order_value",
                "status": "status",
                "invoice_status": "invoice_status",
                "purchase_date": "purchase_date",
                "expected_delivery_date": "expected_delivery_date"
            }

            sort_field = allowed_sort_fields.get(
                sort_by.strip().lower()
            )

            if sort_field:
                reverse = (
                    sort_order.strip().lower() == "desc"
                )

                report.sort(
                    key=lambda item: (
                        item.get(sort_field) is None,
                        item.get(sort_field)
                    ),
                    reverse=reverse
                )
        return {
            "report_type": "Purchase Order Report",
            "total_purchase_orders": len(report),
            "purchase_orders": report
        }
    @staticmethod
    def get_compliance_report(
        db: Session,
        vendor_name: str = None,
        vendor_category: str = None,
        compliance_status: str = None
    ):
        # Get the compliance data already calculated
        compliance_data = get_compliance(db)

        # Get vendors for category filtering
        vendors = {
            vendor.id: vendor
            for vendor in db.query(Vendor).all()
        }

        report = []

        for item in compliance_data:

            vendor = vendors.get(item.vendor_id)

            if not vendor:
                continue

            # Vendor name filter
            if vendor_name:
                if vendor_name.strip().lower() not in \
                        vendor.company_name.lower():
                    continue

            # Vendor category filter - case insensitive
            if vendor_category:
                category_value = vendor_category.strip().lower()

                actual_category = (
                    vendor.vendor_category.value
                    if vendor.vendor_category
                    else ""
                )

                if actual_category.lower() != category_value:
                    continue

            # Compliance status filter - case insensitive
            if compliance_status:
                requested_status = (
                    compliance_status.strip().lower()
                )

                actual_status = (
                    item.overall_status.lower()
                    if item.overall_status
                    else ""
                )

                if actual_status != requested_status:
                    continue

            report.append({
                "vendor_id": item.vendor_id,
                "vendor_name": item.vendor_name,
                "vendor_category": (
                    vendor.vendor_category.value
                    if vendor.vendor_category
                    else None
                ),
                "contract_status": item.contract_status,
                "certification_status": item.certification_status,
                "document_status": item.document_status,
                "compliance_percentage": (
                    item.compliance_percentage
                ),
                "overall_status": item.overall_status
            })

        # Summary based on filtered results
        total_vendors = len(report)

        compliant_vendors = sum(
            1
            for item in report
            if item["overall_status"].lower() == "compliant"
        )

        non_compliant_vendors = (
            total_vendors - compliant_vendors
        )

        average_compliance = (
            round(
                sum(
                    item["compliance_percentage"]
                    for item in report
                ) / total_vendors,
                2
            )
            if total_vendors
            else 0
        )

        return {
            "report_type": "Compliance Report",
            "total_vendors": total_vendors,
            "compliant_vendors": compliant_vendors,
            "non_compliant_vendors": non_compliant_vendors,
            "average_compliance_percentage":
                average_compliance,
            "vendors": report
        }
    @staticmethod
    def get_contract_report(
        db: Session,
        vendor_name: str = None,
        contract_type: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None,
        expiring_within_days: int = None
    ):

        query = db.query(Contract)

        # -----------------------------
        # Date filters
        # -----------------------------
        if start_date:
            query = query.filter(
                Contract.start_date >= start_date
            )

        if end_date:
            query = query.filter(
                Contract.end_date <= end_date
            )

        # -----------------------------
        # Vendor filter
        # -----------------------------
        if vendor_name:
            query = query.join(Contract.vendor).filter(
                Vendor.company_name.ilike(
                    f"%{vendor_name.strip()}%"
                )
            )

        # -----------------------------
        # Contract type filter
        # -----------------------------
        if contract_type:
            query = query.filter(
                Contract.contract_type.ilike(
                    f"%{contract_type.strip()}%"
                )
            )

        # -----------------------------
        # Status filter - case insensitive
        # -----------------------------
        if status:
            status_value = status.strip().lower()

            valid_statuses = {
                item.value.lower(): item.value
                for item in ContractStatus
            }

            if status_value in valid_statuses:
                actual_status = valid_statuses[status_value]

                query = query.filter(
                    Contract.status == actual_status
                )
            else:
                return {
                    "report_type": "Contract Report",
                    "total_contracts": 0,
                    "contracts": [],
                    "message": (
                        f"Invalid contract status '{status}'. "
                        f"Valid values are: "
                        f"{', '.join(item.value for item in ContractStatus)}"
                    )
                }

        # -----------------------------
        # Expiring within X days
        # -----------------------------
        if expiring_within_days is not None:

            today = date.today()

            expiry_limit = (
                today +
                timedelta(days=expiring_within_days)
            )

            query = query.filter(
                Contract.end_date >= today,
                Contract.end_date <= expiry_limit
            )

        contracts = query.all()

        report = []

        for contract in contracts:

            vendor = contract.vendor

            report.append({
                "contract_id": contract.id,
                "contract_number": contract.contract_number,
                "contract_title": contract.contract_title,
                "contract_type": contract.contract_type,
                "vendor_name": (
                    vendor.company_name
                    if vendor else None
                ),
                "contract_value": contract.contract_value,
                "start_date": contract.start_date,
                "end_date": contract.end_date,
                "status": (
                    contract.status.value
                    if contract.status
                    else None
                ),
                "description": contract.description
            })

        # -----------------------------
        # Summary
        # -----------------------------
        total_contract_value = sum(
            contract["contract_value"] or 0
            for contract in report
        )

        return {
            "report_type": "Contract Report",
            "total_contracts": len(report),
            "total_contract_value": total_contract_value,
            "contracts": report
        }
    @staticmethod
    def get_executive_summary(
        db: Session,
        start_date: str = None,
        end_date: str = None
    ):

        # ---------------------------------------
        # Vendors
        # ---------------------------------------
        vendors = db.query(Vendor).all()

        total_vendors = len(vendors)

        active_vendors = sum(
            1
            for vendor in vendors
            if vendor.vendor_status == VendorStatus.ACTIVE
        )

        # ---------------------------------------
        # Reliability distribution
        # ---------------------------------------
        reliability_records = (
            db.query(VendorReliability).all()
        )

        reliability_distribution = {
            "high": 0,
            "medium": 0,
            "low": 0
        }

        for record in reliability_records:

            score = record.reliability_score or 0

            if score >= 80:
                reliability_distribution["high"] += 1

            elif score >= 60:
                reliability_distribution["medium"] += 1

            else:
                reliability_distribution["low"] += 1

        # ---------------------------------------
        # Procurement requests
        # ---------------------------------------
        request_query = db.query(ProcurementRequest)

        if start_date:
            request_query = request_query.filter(
                ProcurementRequest.created_at >= start_date
            )

        if end_date:
            request_query = request_query.filter(
                ProcurementRequest.created_at <= end_date
            )

        procurement_requests = request_query.all()

        total_requests = len(procurement_requests)

        completed_requests = sum(
            1
            for request in procurement_requests
            if request.request_status ==
            ProcurementStatus.COMPLETED
        )

        procurement_completion_rate = (
            round(
                completed_requests /
                total_requests * 100,
                2
            )
            if total_requests
            else 0
        )

        # ---------------------------------------
        # Purchase Orders
        # ---------------------------------------
        po_query = db.query(PurchaseOrder)

        if start_date:
            po_query = po_query.filter(
                PurchaseOrder.purchase_order_date >= start_date
            )

        if end_date:
            po_query = po_query.filter(
                PurchaseOrder.purchase_order_date <= end_date
            )

        purchase_orders = po_query.all()

        procurement_spending = sum(
            po.total_cost or 0
            for po in purchase_orders
        )

        # ---------------------------------------
        # Delayed deliveries
        # ---------------------------------------
        today = date.today()

        delayed_deliveries = 0

        for po in purchase_orders:

            if (
                po.expected_delivery_date
                and po.expected_delivery_date < today
                and po.status != PurchaseOrderStatus.COMPLETED
            ):
                delayed_deliveries += 1

        # ---------------------------------------
        # Contracts near expiry
        # ---------------------------------------
        expiry_limit = today + timedelta(days=60)

        contracts_near_expiry = (
            db.query(Contract)
            .filter(
                Contract.end_date >= today,
                Contract.end_date <= expiry_limit
            )
            .count()
        )

        # ---------------------------------------
        # Compliance
        # ---------------------------------------
        compliance_data = get_compliance(db)

        average_compliance = (
            round(
                sum(
                    item.compliance_percentage
                    for item in compliance_data
                ) / len(compliance_data),
                2
            )
            if compliance_data
            else 0
        )

        # ---------------------------------------
        # Top performing vendors
        # ---------------------------------------
        top_vendors = []

        performance_records = []

        for vendor in vendors:

            performance = vendor.vendor_performance

            if performance:
                performance_records.append({
                    "vendor_id": vendor.id,
                    "vendor_name": vendor.company_name,
                    "score": (
                        performance.overall_vendor_score or 0
                    )
                })

        performance_records.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        top_vendors = performance_records[:5]

        # ---------------------------------------
        # Monthly procurement trends
        # ---------------------------------------
        monthly_trends = {}

        for po in purchase_orders:

            if not po.purchase_order_date:
                continue

            month = po.purchase_order_date.strftime(
                "%Y-%m"
            )

            if month not in monthly_trends:
                monthly_trends[month] = {
                    "orders": 0,
                    "spending": 0
                }

            monthly_trends[month]["orders"] += 1

            monthly_trends[month]["spending"] += (
                po.total_cost or 0
            )

        return {
            "report_type": "Executive Summary Report",

            "vendor_summary": {
                "total_registered_vendors": total_vendors,
                "active_vendors": active_vendors
            },

            "procurement_summary": {
                "procurement_spending": procurement_spending,
                "total_requests": total_requests,
                "completed_requests": completed_requests,
                "completion_rate":
                    procurement_completion_rate
            },

            "vendor_reliability_distribution":
                reliability_distribution,

            "top_performing_vendors":
                top_vendors,

            "delayed_deliveries":
                delayed_deliveries,

            "contracts_near_expiry":
                contracts_near_expiry,

            "average_compliance_percentage":
                average_compliance,

            "monthly_procurement_trends":
                monthly_trends
        }