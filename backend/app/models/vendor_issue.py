from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class VendorIssue(Base):
    __tablename__ = "vendor_issues"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    issue_type = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    status = Column(
        String,
        default="Open"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
