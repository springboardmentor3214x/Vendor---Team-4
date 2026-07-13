"""
Authentication API routes.

Handles user registration, login, logout, token management,
password operations, and profile management.
"""

import logging

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    blacklist_token,
    get_current_active_user,
    oauth2_scheme,
)
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ProfileUpdateRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

logger = logging.getLogger("vrip.api.auth")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account. The default role is 'Vendor' unless specified.",
    responses={
        201: {
            "description": "User registered successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User registered successfully.",
                        "data": {
                            "id": 1,
                            "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                            "first_name": "John",
                            "last_name": "Doe",
                            "username": "johndoe",
                            "email": "john.doe@example.com",
                            "role": {"id": 4, "uuid": "...", "name": "Vendor"},
                        },
                    }
                }
            },
        },
        400: {
            "description": "Validation error or duplicate email/username.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Email already registered.",
                        "errors": [
                            "A user with email 'john.doe@example.com' already exists."
                        ],
                    }
                }
            },
        },
    },
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Register a new user account."""
    service = AuthService(db)
    user = service.register_user(data)
    return {
        "success": True,
        "message": "User registered successfully.",
        "data": user.model_dump(),
    }


@router.post(
    "/login",
    response_model=dict,
    summary="User login",
    description="Authenticate with email/username and password. Returns JWT access and refresh tokens.",
    responses={
        200: {
            "description": "Login successful.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Login successful.",
                        "data": {
                            "access_token": "eyJhbGciOiJIUzI1NiIs...",
                            "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                            "token_type": "bearer",
                        },
                    }
                }
            },
        },
        401: {
            "description": "Invalid credentials.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Invalid credentials.",
                        "errors": [
                            "The email/username or password is incorrect."
                        ],
                    }
                }
            },
        },
    },
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    """
    Authenticate user and return JWT tokens.

    This endpoint accepts OAuth2 form data (username + password)
    to be compatible with FastAPI's built-in Swagger authorize button.
    The 'username' field can contain either an email or username.
    """
    login_data = LoginRequest(username=form_data.username, password=form_data.password)
    service = AuthService(db)
    tokens = service.login(login_data)
    return {
        "success": True,
        "message": "Login successful.",
        "data": tokens.model_dump(),
    }


@router.post(
    "/logout",
    response_model=dict,
    summary="Logout user",
    description="Invalidate the current access token by adding it to the blacklist.",
    responses={
        200: {
            "description": "Logout successful.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Logged out successfully.",
                    }
                }
            },
        }
    },
)
def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Logout by blacklisting the current access token."""
    blacklist_token(token)
    logger.info("User logged out: %s (%s)", current_user.username, current_user.email)
    return {"success": True, "message": "Logged out successfully."}


@router.post(
    "/refresh-token",
    response_model=dict,
    summary="Refresh access token",
    description="Exchange a valid refresh token for new access and refresh tokens.",
    responses={
        200: {
            "description": "Token refreshed successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Token refreshed successfully.",
                        "data": {
                            "access_token": "eyJhbGciOiJIUzI1NiIs...",
                            "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                            "token_type": "bearer",
                        },
                    }
                }
            },
        },
        401: {
            "description": "Invalid or expired refresh token.",
        },
    },
)
def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Refresh the access token using a valid refresh token."""
    service = AuthService(db)
    tokens = service.refresh_token(data.refresh_token)
    return {
        "success": True,
        "message": "Token refreshed successfully.",
        "data": tokens.model_dump(),
    }


@router.post(
    "/forgot-password",
    response_model=dict,
    summary="Request password reset",
    description="Send a password reset token to the user's email address. Always returns success to prevent email enumeration.",
    responses={
        200: {
            "description": "Reset email sent (if account exists).",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "If an account with that email exists, a reset link has been sent.",
                    }
                }
            },
        }
    },
)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Initiate the password reset flow."""
    service = AuthService(db)
    return service.forgot_password(data)


@router.post(
    "/reset-password",
    response_model=dict,
    summary="Reset password",
    description="Reset the user's password using a valid reset token received via email.",
    responses={
        200: {
            "description": "Password reset successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Password has been reset successfully.",
                    }
                }
            },
        },
        400: {"description": "Invalid or expired reset token."},
    },
)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Reset password with a valid reset token."""
    service = AuthService(db)
    return service.reset_password(data)


@router.post(
    "/change-password",
    response_model=dict,
    summary="Change password",
    description="Change the current user's password. Requires the current password for verification.",
    responses={
        200: {
            "description": "Password changed successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Password changed successfully.",
                    }
                }
            },
        },
        400: {"description": "Current password is incorrect."},
    },
)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """Change the authenticated user's password."""
    service = AuthService(db)
    return service.change_password(current_user, data)


@router.get(
    "/me",
    response_model=dict,
    summary="Get current user profile",
    description="Retrieve the profile of the currently authenticated user.",
    responses={
        200: {
            "description": "Current user profile.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Profile retrieved successfully.",
                        "data": {
                            "id": 1,
                            "uuid": "a1b2c3d4-...",
                            "first_name": "John",
                            "last_name": "Doe",
                            "username": "johndoe",
                            "email": "john.doe@example.com",
                            "role": {"id": 4, "uuid": "...", "name": "Vendor"},
                        },
                    }
                }
            },
        }
    },
)
def get_me(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Get the current authenticated user's profile."""
    user_data = UserResponse.model_validate(current_user)
    return {
        "success": True,
        "message": "Profile retrieved successfully.",
        "data": user_data.model_dump(),
    }


@router.put(
    "/profile",
    response_model=dict,
    summary="Update profile",
    description="Update the current user's profile information (name, phone, company, etc.).",
    responses={
        200: {
            "description": "Profile updated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Profile updated successfully.",
                        "data": {"first_name": "John", "last_name": "Updated"},
                    }
                }
            },
        }
    },
)
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """Update the current user's profile."""
    service = AuthService(db)
    user = service.update_profile(current_user, data)
    return {
        "success": True,
        "message": "Profile updated successfully.",
        "data": user.model_dump(),
    }
