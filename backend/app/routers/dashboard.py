from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.dashboard import (
    DashboardOverviewResponse,
    VendorDashboardResponse,
    ProcurementDashboardResponse,
    DeliveryDashboardResponse,
    ContractDashboardResponse,
    CommunicationDashboardResponse,
    AdminDashboardResponse
)

from app.services import dashboard_service

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/overview",
    response_model=DashboardOverviewResponse
)
def get_dashboard_overview(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_dashboard_overview(db)

@router.get(
    "/vendors",
    response_model=VendorDashboardResponse
)
def get_vendor_dashboard(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_vendor_dashboard(db)

@router.get(
    "/procurement",
    response_model=ProcurementDashboardResponse
)
def get_procurement_dashboard(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_procurement_dashboard(db)

@router.get(
    "/delivery",
    response_model=DeliveryDashboardResponse
)
def get_delivery_dashboard(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_delivery_dashboard(db)

@router.get(
    "/contracts",
    response_model=ContractDashboardResponse
)
def get_contract_dashboard(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_contract_dashboard(db)

@router.get(
    "/communication",
    response_model=CommunicationDashboardResponse
)
def get_communication_dashboard(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_communication_dashboard(db)

@router.get(
    "/admin",
    response_model=AdminDashboardResponse
)
def get_admin_dashboard(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_admin_dashboard(db)