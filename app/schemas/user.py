"""
Pydantic schemas for user management endpoints.

Includes create, update, response, and list schemas.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.utils.validators import validate_password_strength


class UserCreate(BaseModel):
    """Schema for admin-created users."""

    first_name: str = Field(..., min_length=1, max_length=100, examples=["Jane"])
    last_name: str = Field(..., min_length=1, max_length=100, examples=["Smith"])
    username: str = Field(..., min_length=3, max_length=50, examples=["janesmith"])
    email: EmailStr = Field(..., examples=["jane.smith@example.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["SecureP@ss1"])
    phone_number: str | None = Field(default=None, max_length=20, examples=["+1-987-654-3210"])
    company_name: str | None = Field(default=None, max_length=255, examples=["Global Supply Co"])
    designation: str | None = Field(default=None, max_length=255, examples=["Finance Lead"])
    role_name: str = Field(
        default="Vendor",
        description="Role to assign to the user.",
        examples=["Procurement Manager"],
    )
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        errors = validate_password_strength(v)
        if errors:
            raise ValueError("; ".join(errors))
        return v


class UserUpdate(BaseModel):
    """Schema for admin user updates."""

    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    phone_number: str | None = Field(default=None, max_length=20)
    company_name: str | None = Field(default=None, max_length=255)
    designation: str | None = Field(default=None, max_length=255)
    role_name: str | None = Field(default=None, description="New role to assign.")
    is_active: bool | None = Field(default=None)
    is_verified: bool | None = Field(default=None)
    profile_image: str | None = Field(default=None)


class RoleInfo(BaseModel):
    """Nested role information in user response."""

    id: int
    uuid: str
    name: str

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    """Single user response schema."""

    id: int
    uuid: str
    first_name: str
    last_name: str
    username: str
    email: str
    phone_number: str | None = None
    company_name: str | None = None
    designation: str | None = None
    profile_image: str | None = None
    is_active: bool
    is_verified: bool
    is_superuser: bool
    role: RoleInfo | None = None
    last_login: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                    "first_name": "John",
                    "last_name": "Doe",
                    "username": "johndoe",
                    "email": "john.doe@example.com",
                    "phone_number": "+1-234-567-8900",
                    "company_name": "Acme Corp",
                    "designation": "Procurement Lead",
                    "profile_image": None,
                    "is_active": True,
                    "is_verified": False,
                    "is_superuser": False,
                    "role": {
                        "id": 4,
                        "uuid": "r1o2l3e4-5678-90ab-cdef-1234567890ab",
                        "name": "Vendor",
                    },
                    "last_login": None,
                    "created_at": "2025-01-15T10:30:00Z",
                    "updated_at": "2025-01-15T10:30:00Z",
                }
            ]
        },
    }


class UserListResponse(BaseModel):
    """Paginated list of users response."""

    success: bool = True
    message: str = "Users retrieved successfully."
    data: list[UserResponse]
    total: int
    page: int
    per_page: int
