from typing import Literal, Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    model_validator
)


UserRole = Literal[
    "Administrator",
    "Procurement Manager",
    "Supply Chain Manager",
    "Vendor",
    "Finance Officer",
    "Auditor",
]


class UserCreate(BaseModel):

    full_name: str = Field(min_length=2)

    employee_id: Optional[str] = None

    company_name: Optional[str] = None

    email: EmailStr

    mobile_number: str = Field(
        pattern=r"^[0-9]{10}$"
    )

    password: str = Field(min_length=8)

    role: UserRole

    @model_validator(mode="after")
    def validate_role_fields(self):

        if self.role == "Vendor":

            if not self.company_name:
                raise ValueError(
                    "Company name is required for Vendor"
                )

        else:

            if not self.employee_id:
                raise ValueError(
                    "Employee ID is required for internal users"
                )

        return self


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int

    full_name: str

    employee_id: Optional[str]

    company_name: Optional[str]

    email: str

    mobile_number: str

    role: str

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):

    email: EmailStr


class ResetPasswordRequest(BaseModel):

    token: str

    new_password: str = Field(
        min_length=8
    )

    confirm_password: str = Field(
        min_length=8
    )

    @model_validator(mode="after")
    def validate_passwords(self):

        if (
            self.new_password
            != self.confirm_password
        ):

            raise ValueError(
                "Passwords do not match"
            )

        return self


class UserProfileUpdate(BaseModel):

    full_name: str = Field(
        min_length=2
    )

    mobile_number: str = Field(
        pattern=r"^[0-9]{10}$"
    )


class UpdatePasswordRequest(BaseModel):

    current_password: str

    new_password: str = Field(
        min_length=8
    )

    confirm_password: str = Field(
        min_length=8
    )

    @model_validator(mode="after")
    def validate_passwords(self):

        if (
            self.new_password
            != self.confirm_password
        ):

            raise ValueError(
                "Passwords do not match"
            )

        return self