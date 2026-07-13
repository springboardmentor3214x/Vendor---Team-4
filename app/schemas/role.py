"""
Pydantic schemas for role management endpoints.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class RoleCreate(BaseModel):
    """Schema for creating a new role."""

    name: str = Field(
        ..., min_length=2, max_length=100, examples=["Quality Inspector"]
    )
    description: str | None = Field(
        default=None,
        max_length=500,
        examples=["Inspects vendor deliveries for quality compliance."],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Quality Inspector",
                    "description": "Inspects vendor deliveries for quality compliance.",
                }
            ]
        }
    }


class RoleUpdate(BaseModel):
    """Schema for updating an existing role."""

    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    is_active: bool | None = Field(default=None)


class RoleResponse(BaseModel):
    """Single role response schema."""

    id: int
    uuid: str
    name: str
    description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "uuid": "r1o2l3e4-5678-90ab-cdef-1234567890ab",
                    "name": "Administrator",
                    "description": "Full system access with all privileges.",
                    "is_active": True,
                    "created_at": "2025-01-01T00:00:00Z",
                    "updated_at": "2025-01-01T00:00:00Z",
                }
            ]
        },
    }


class RoleListResponse(BaseModel):
    """List of roles response."""

    success: bool = True
    message: str = "Roles retrieved successfully."
    data: list[RoleResponse]
