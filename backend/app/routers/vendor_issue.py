from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User

from app.schemas.vendor_issue import (
    VendorIssueCreate,
    VendorIssueResponse
)

from app.services.vendor_issue_service import VendorIssueService

router = APIRouter(
    prefix="/vendor-issues",
    tags=["Vendor Issues"]
)


@router.post(
    "/",
    response_model=VendorIssueResponse
)
def create_issue(
    issue: VendorIssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return VendorIssueService.create_issue(db, issue)


@router.get(
    "/",
    response_model=list[VendorIssueResponse]
)
def get_all_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return VendorIssueService.get_all_issues(db)


@router.put(
    "/{issue_id}/close",
    response_model=VendorIssueResponse
)
def close_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return VendorIssueService.close_issue(db, issue_id)