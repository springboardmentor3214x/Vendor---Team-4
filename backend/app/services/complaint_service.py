from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.complaint import Complaint


class ComplaintService:

    @staticmethod
    def create_complaint(db: Session, complaint):
        new_complaint = Complaint(**complaint.dict())

        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)

        return new_complaint

    @staticmethod
    def get_all_complaints(db: Session):
        return db.query(Complaint).all()

    @staticmethod
    def get_complaint(db: Session, complaint_id: int):
        complaint = db.query(Complaint).filter(
            Complaint.id == complaint_id
        ).first()

        if not complaint:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found."
            )

        return complaint

    @staticmethod
    def resolve_complaint(db: Session, complaint_id: int):
        complaint = db.query(Complaint).filter(
            Complaint.id == complaint_id
        ).first()

        if not complaint:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found."
            )

        complaint.status = "Resolved"

        db.commit()
        db.refresh(complaint)

        return complaint