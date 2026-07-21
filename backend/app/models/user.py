from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    employee_id = Column(String, nullable=True)

    company_name = Column(String, nullable=True)

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    mobile_number = Column(String, nullable=False)

    hashed_password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    # Requests created by this user
    procurement_requests = relationship(
        "ProcurementRequest",
        foreign_keys="ProcurementRequest.requested_by",
        back_populates="requester"
    )

    # Requests approved by this user
    approved_procurements = relationship(
        "ProcurementRequest",
        foreign_keys="ProcurementRequest.approved_by",
        back_populates="approver"
    )