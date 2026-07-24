from sqlalchemy import Column, Integer, String
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