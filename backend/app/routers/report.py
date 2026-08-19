from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

from app.schemas.notification import NotificationCreate
from app.utils.excel_generator import generate_excel
from app.utils.pdf_generator import generate_pdf
from app.database import get_db
from app.services.report_service import ReportService

from app.auth import get_current_user
from app.models.notification import (
    NotificationType,
    NotificationPriority,
    DeliveryMethod
)
from app.services import notification_service

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

def create_report_notification(
    db,
    user_id: int,
    report_name: str
):
    notification_data = NotificationCreate(
        user_id=user_id,
        notification_type=NotificationType.SYSTEM,
        title="Report Generated",
        description=(
            f"{report_name} report has been generated successfully."
        ),
        related_module="Reports",
        related_record_id=None,
        priority=NotificationPriority.MEDIUM,
        delivery_method=DeliveryMethod.IN_APP
    )

    return notification_service.create_notification(
        db,
        notification_data
    )

@router.get("/vendor-performance")
def get_vendor_performance_report(
    vendor_category: str = None,
    vendor_name: str = None,
    sort_by: str = None,
    sort_order: str = "desc",
    db: Session = Depends(get_db)
):

    return ReportService.get_vendor_performance_report(
        db=db,
        vendor_category=vendor_category,
        vendor_name=vendor_name
    )

@router.get("/procurement")
def get_procurement_report(
    department_name: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):

    return ReportService.get_procurement_report(
        db=db,
        department_name=department_name,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/purchase-orders")
def get_purchase_order_report(
    vendor_name: str = None,
    category: str = None,
    department_name: str = None,
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    sort_by: str = None,
    sort_order: str = "desc",
    db: Session = Depends(get_db)
):

    return ReportService.get_purchase_order_report(
        db=db,
        vendor_name=vendor_name,
        category=category,
        department_name=department_name,
        status=status,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/compliance")
def get_compliance_report(
    vendor_name: str = None,
    vendor_category: str = None,
    compliance_status: str = None,
    db: Session = Depends(get_db)
):

    return ReportService.get_compliance_report(
        db=db,
        vendor_name=vendor_name,
        vendor_category=vendor_category,
        compliance_status=compliance_status
    )

@router.get("/contracts")
def get_contract_report(
    vendor_name: str = None,
    contract_type: str = None,
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    expiring_within_days: int = None,
    db: Session = Depends(get_db)
):

    return ReportService.get_contract_report(
        db=db,
        vendor_name=vendor_name,
        contract_type=contract_type,
        status=status,
        start_date=start_date,
        end_date=end_date,
        expiring_within_days=expiring_within_days
    )

@router.get("/executive-summary")
def get_executive_summary(
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):

    return ReportService.get_executive_summary(
        db=db,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/executive-summary/pdf")
def get_executive_summary_pdf(
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    report_data = ReportService.get_executive_summary(
        db=db,
        start_date=start_date,
        end_date=end_date
    )

    filters = {
        "start_date": start_date,
        "end_date": end_date
    }

    pdf_file = generate_pdf(
        report_title="Executive Summary Report",
        report_data=report_data,
        filters=filters
    )
    create_report_notification(
        db=db,
        user_id=current_user.id,
        report_name="Executive Summary"
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=executive_summary.pdf"
        }
    )

@router.get("/vendor-performance/pdf")
def get_vendor_performance_pdf(
    vendor_name: str = None,
    vendor_category: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_data = ReportService.get_vendor_performance_report(
        db=db,
        vendor_name=vendor_name,
        vendor_category=vendor_category
    )

    filters = {
        "vendor_name": vendor_name,
        "vendor_category": vendor_category
    }

    pdf_file = generate_pdf(
        report_title="Vendor Performance Report",
        report_data=report_data,
        filters=filters
    )
    create_report_notification(
        db=db,
        user_id=current_user.id,
        report_name="Vendor Performance"
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=vendor_performance.pdf"
        }
    )

@router.get("/procurement/pdf")
def get_procurement_pdf(
    department_name: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_data = ReportService.get_procurement_report(
        db=db, department_name=department_name, start_date=start_date, end_date=end_date
    )

    pdf_file = generate_pdf(
        report_title="Procurement Report",
        report_data=report_data,
        filters={"department_name": department_name, "start_date": start_date, "end_date": end_date}
    )

    create_report_notification(
        db=db,
        user_id=current_user.id,
        report_name="Procurement"
    )
    
    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=procurement_report.pdf"
        }
    )

@router.get("/purchase-orders/pdf")
def get_purchase_orders_pdf(
    vendor_name: str = None,
    category: str = None,
    department_name: str = None,
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_data = ReportService.get_purchase_order_report(
        db=db, vendor_name=vendor_name, category=category, department_name=department_name,
        status=status, start_date=start_date, end_date=end_date
    )

    pdf_file = generate_pdf(
        report_title="Purchase Order Report",
        report_data=report_data,
        filters={"vendor_name": vendor_name, "category": category, "department_name": department_name, "status": status, "start_date": start_date, "end_date": end_date}
    )

    create_report_notification(
        db=db,
        user_id=current_user.id,
        report_name="Purchase Orders"
    )
    
    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=purchase_orders.pdf"
        }
    )

@router.get("/compliance/pdf")
def get_compliance_pdf(
    vendor_name: str = None,
    vendor_category: str = None,
    compliance_status: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_data = ReportService.get_compliance_report(
        db=db, vendor_name=vendor_name, vendor_category=vendor_category, compliance_status=compliance_status
    )

    pdf_file = generate_pdf(
        report_title="Compliance Report",
        report_data=report_data,
        filters={"vendor_name": vendor_name, "vendor_category": vendor_category, "compliance_status": compliance_status}
    )

    create_report_notification(
        db=db,
        user_id=current_user.id,
        report_name="Compliance"
    )
    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=compliance_report.pdf"
        }
    )

@router.get("/contracts/pdf")
def get_contracts_pdf(
    vendor_name: str = None,
    contract_type: str = None,
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    expiring_within_days: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    report_data = ReportService.get_contract_report(
        db=db, vendor_name=vendor_name, contract_type=contract_type, status=status,
        start_date=start_date, end_date=end_date, expiring_within_days=expiring_within_days
    )

    pdf_file = generate_pdf(
        report_title="Contract Report",
        report_data=report_data,
        filters={"vendor_name": vendor_name, "contract_type": contract_type, "status": status, "start_date": start_date, "end_date": end_date, "expiring_within_days": expiring_within_days}
    )
    create_report_notification(
        db=db,
        user_id=current_user.id,
        report_name="Contracts"
    )
    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=contract_report.pdf"
        }
    )

@router.get("/executive-summary/excel")
def get_executive_summary_excel(
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):

    report_data = ReportService.get_executive_summary(
        db=db,
        start_date=start_date,
        end_date=end_date
    )

    filters = {
        "start_date": start_date,
        "end_date": end_date
    }

    excel_file = generate_excel(
        report_title="Executive Summary Report",
        report_data=report_data,
        filters=filters
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; filename=executive_summary.xlsx"
        }
    )

@router.get("/vendor-performance/excel")
def get_vendor_performance_excel(
    vendor_name: str = None,
    vendor_category: str = None,
    db: Session = Depends(get_db)
):
    report_data = ReportService.get_vendor_performance_report(
        db=db, vendor_name=vendor_name, vendor_category=vendor_category
    )

    excel_file = generate_excel(
        report_title="Vendor Performance Report",
        report_data=report_data,
        filters={"vendor_name": vendor_name, "vendor_category": vendor_category}
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; filename=vendor_performance.xlsx"
        }
    )

@router.get("/procurement/excel")
def get_procurement_excel(
    department_name: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    report_data = ReportService.get_procurement_report(
        db=db, department_name=department_name, start_date=start_date, end_date=end_date
    )

    excel_file = generate_excel(
        report_title="Procurement Report",
        report_data=report_data,
        filters={"department_name": department_name, "start_date": start_date, "end_date": end_date}
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; filename=procurement_report.xlsx"
        }
    )

@router.get("/purchase-orders/excel")
def get_purchase_orders_excel(
    vendor_name: str = None,
    category: str = None,
    department_name: str = None,
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    report_data = ReportService.get_purchase_order_report(
        db=db, vendor_name=vendor_name, category=category, department_name=department_name,
        status=status, start_date=start_date, end_date=end_date
    )

    excel_file = generate_excel(
        report_title="Purchase Order Report",
        report_data=report_data,
        filters={"vendor_name": vendor_name, "category": category, "department_name": department_name, "status": status, "start_date": start_date, "end_date": end_date}
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; filename=purchase_orders.xlsx"
        }
    )

@router.get("/compliance/excel")
def get_compliance_excel(
    vendor_name: str = None,
    vendor_category: str = None,
    compliance_status: str = None,
    db: Session = Depends(get_db)
):
    report_data = ReportService.get_compliance_report(
        db=db, vendor_name=vendor_name, vendor_category=vendor_category, compliance_status=compliance_status
    )

    excel_file = generate_excel(
        report_title="Compliance Report",
        report_data=report_data,
        filters={"vendor_name": vendor_name, "vendor_category": vendor_category, "compliance_status": compliance_status}
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; filename=compliance_report.xlsx"
        }
    )

@router.get("/contracts/excel")
def get_contracts_excel(
    vendor_name: str = None,
    contract_type: str = None,
    status: str = None,
    start_date: str = None,
    end_date: str = None,
    expiring_within_days: int = None,
    db: Session = Depends(get_db)
):
    report_data = ReportService.get_contract_report(
        db=db, vendor_name=vendor_name, contract_type=contract_type, status=status,
        start_date=start_date, end_date=end_date, expiring_within_days=expiring_within_days
    )

    excel_file = generate_excel(
        report_title="Contract Report",
        report_data=report_data,
        filters={"vendor_name": vendor_name, "contract_type": contract_type, "status": status, "start_date": start_date, "end_date": end_date, "expiring_within_days": expiring_within_days}
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; filename=contract_report.xlsx"
        }
    )
