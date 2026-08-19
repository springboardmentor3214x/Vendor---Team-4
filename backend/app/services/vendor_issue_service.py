from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.vendor_issue import VendorIssue


class VendorIssueService:

    @staticmethod
    def create_issue(db: Session, issue):
        new_issue = VendorIssue(**issue.dict())

        db.add(new_issue)
        db.commit()
        db.refresh(new_issue)

        return new_issue

    @staticmethod
    def get_all_issues(db: Session):
        return db.query(VendorIssue).all()

    @staticmethod
    def close_issue(db: Session, issue_id: int):
        issue = db.query(VendorIssue).filter(
            VendorIssue.id == issue_id
        ).first()

        if not issue:
            raise HTTPException(
                status_code=404,
                detail="Issue not found."
            )

        issue.status = "Closed"

        db.commit()
        db.refresh(issue)

        return issue