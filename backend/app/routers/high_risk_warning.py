from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth import get_current_user

from app.schemas.high_risk_warning import HighRiskWarningResponse
from app.services.high_risk_warning_service import HighRiskWarningService

router = APIRouter(
    prefix="/high-risk-warning",
    tags=["High Risk Warning"]
)


@router.get(
    "/{vendor_id}",
    response_model=HighRiskWarningResponse
)
def get_warning(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return HighRiskWarningService.get_warning(db, vendor_id)