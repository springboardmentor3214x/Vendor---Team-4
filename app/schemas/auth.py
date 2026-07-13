"""
Pydantic schemas for authentication endpoints.

Covers registration, login, token handling, password operations.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.utils.validators import validate_password_strength


# =============================================================================
# Request Schemas
# =============================================================================


class RegisterRequest(BaseModel):
    """Schema for user registration."""

    first_name: str = Field(
        ..., min_length=1, max_length=100, examples=["John"]
    )
    last_name: str = Field(
        ..., min_length=1, max_length=100, examples=["Doe"]
    )
    username: str = Field(
        ..., min_length=3, max_length=50, examples=["johndoe"]
    )
    email: EmailStr = Field(..., examples=["john.doe@example.com"])
    password: str = Field(
        ..., min_length=8, max_length=128, examples=["SecureP@ss1"]
    )
    phone_number: str | None = Field(
        default=None, max_length=20, examples=["+1-234-567-8900"]
    )
    company_name: str | None = Field(
        default=None, max_length=255, examples=["Acme Corp"]
    )
    designation: str | None = Field(
        default=None, max_length=255, examples=["Procurement Lead"]
    )
    role_name: str | None = Field(
        default=None,
        description="Role name to assign. Defaults to 'Vendor' if not specified.",
        examples=["Vendor"],
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        errors = validate_password_strength(v)
        if errors:
            raise ValueError("; ".join(errors))
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "first_name": "John",
                    "last_name": "Doe",
                    "username": "johndoe",
                    "email": "john.doe@example.com",
                    "password": "SecureP@ss1",
                    "phone_number": "+1-234-567-8900",
                    "company_name": "Acme Corp",
                    "designation": "Procurement Lead",
                    "role_name": "Vendor",
                }
            ]
        }
    }


class LoginRequest(BaseModel):
    """Schema for user login. Accepts email or username."""

    username: str = Field(
        ...,
        description="Email address or username.",
        examples=["john.doe@example.com"],
    )
    password: str = Field(..., examples=["SecureP@ss1"])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "john.doe@example.com",
                    "password": "SecureP@ss1",
                }
            ]
        }
    }


class RefreshTokenRequest(BaseModel):
    """Schema for refreshing an access token."""

    refresh_token: str = Field(
        ...,
        description="The refresh token received during login.",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )


class ChangePasswordRequest(BaseModel):
    """Schema for authenticated password change."""

    current_password: str = Field(..., examples=["OldP@ssw0rd"])
    new_password: str = Field(..., min_length=8, max_length=128, examples=["NewSecureP@ss2"])

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        errors = validate_password_strength(v)
        if errors:
            raise ValueError("; ".join(errors))
        return v


class ForgotPasswordRequest(BaseModel):
    """Schema for requesting a password reset email."""

    email: EmailStr = Field(..., examples=["john.doe@example.com"])


class ResetPasswordRequest(BaseModel):
    """Schema for resetting password with a reset token."""

    token: str = Field(
        ...,
        description="The password reset token received via email.",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."],
    )
    new_password: str = Field(..., min_length=8, max_length=128, examples=["NewSecureP@ss3"])

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        errors = validate_password_strength(v)
        if errors:
            raise ValueError("; ".join(errors))
        return v


class ProfileUpdateRequest(BaseModel):
    """Schema for updating the current user's profile."""

    first_name: str | None = Field(default=None, max_length=100, examples=["John"])
    last_name: str | None = Field(default=None, max_length=100, examples=["Doe"])
    phone_number: str | None = Field(default=None, max_length=20, examples=["+1-234-567-8900"])
    company_name: str | None = Field(default=None, max_length=255, examples=["Acme Corp"])
    designation: str | None = Field(default=None, max_length=255, examples=["Senior Manager"])
    profile_image: str | None = Field(default=None, examples=["https://example.com/avatar.jpg"])


# =============================================================================
# Response Schemas
# =============================================================================


class TokenResponse(BaseModel):
    """Response returned after successful login or token refresh."""

    access_token: str = Field(..., examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."])
    refresh_token: str = Field(..., examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."])
    token_type: str = Field(default="bearer", examples=["bearer"])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer",
                }
            ]
        }
    }
