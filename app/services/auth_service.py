"""
Authentication service.

Handles registration, login, token management, and password operations.
All business logic for authentication is centralized here.
"""

import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.role import Role
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.email_service import EmailService
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    verify_token_type,
)
from app.utils.password import hash_password, verify_password
from app.utils.validators import validate_phone_number, validate_username

logger = logging.getLogger("vrip.auth")


class AuthService:
    """Service class encapsulating all authentication operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def register_user(self, data: RegisterRequest) -> UserResponse:
        """
        Register a new user.

        Validates uniqueness of email and username, assigns the specified
        role (defaulting to 'Vendor'), hashes the password, and creates
        the user in the database.

        Args:
            data: Registration request payload.

        Returns:
            UserResponse with the newly created user's data.

        Raises:
            HTTPException 400: On validation errors or duplicate email/username.
            HTTPException 400: If the specified role does not exist.
        """
        # Validate username format
        username_errors = validate_username(data.username)
        if username_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Invalid username.",
                    "errors": username_errors,
                },
            )

        # Validate phone number if provided
        if data.phone_number and not validate_phone_number(data.phone_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Invalid phone number format.",
                    "errors": ["Phone number format is invalid."],
                },
            )

        # Check for duplicate email
        existing_email = self.db.query(User).filter(User.email == data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Email already registered.",
                    "errors": [f"A user with email '{data.email}' already exists."],
                },
            )

        # Check for duplicate username
        existing_username = (
            self.db.query(User).filter(User.username == data.username).first()
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Username already taken.",
                    "errors": [f"A user with username '{data.username}' already exists."],
                },
            )

        # Look up the role
        role_name = data.role_name or "Vendor"
        role = self.db.query(Role).filter(Role.name == role_name).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": f"Role '{role_name}' does not exist.",
                    "errors": [f"Available roles can be retrieved from GET /api/roles."],
                },
            )

        # Create the user
        user = User(
            first_name=data.first_name,
            last_name=data.last_name,
            username=data.username,
            email=data.email,
            phone_number=data.phone_number,
            company_name=data.company_name,
            designation=data.designation,
            hashed_password=hash_password(data.password),
            role_id=role.id,
            is_active=True,
            is_verified=False,
            is_superuser=False,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        logger.info(
            "New user registered: %s (%s) with role '%s'",
            user.username,
            user.email,
            role.name,
        )

        # Send welcome email (non-blocking, logs on failure)
        EmailService.send_welcome_email(user.email, user.first_name)

        return UserResponse.model_validate(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        """
        Authenticate a user and return JWT tokens.

        Accepts either email or username in the `username` field.
        Updates `last_login` timestamp on success.

        Args:
            data: Login request with username/email and password.

        Returns:
            TokenResponse with access and refresh tokens.

        Raises:
            HTTPException 401: On invalid credentials.
            HTTPException 403: If the user account is deactivated.
        """
        # Find user by email or username
        user = (
            self.db.query(User)
            .filter((User.email == data.username) | (User.username == data.username))
            .first()
        )

        if not user or not verify_password(data.password, user.hashed_password):
            logger.warning("Failed login attempt for: %s", data.username)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "success": False,
                    "message": "Invalid credentials.",
                    "errors": ["The email/username or password is incorrect."],
                },
            )

        if not user.is_active:
            logger.warning("Login attempt for deactivated account: %s", user.email)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "message": "Account deactivated.",
                    "errors": [
                        "Your account has been deactivated. Contact an administrator."
                    ],
                },
            )

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        self.db.commit()

        # Generate tokens
        token_data = {
            "sub": user.uuid,
            "email": user.email,
            "role": user.role.name if user.role else None,
            "user_id": user.id,
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        logger.info("User logged in: %s (%s)", user.username, user.email)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )

    def refresh_token(self, refresh_token_str: str) -> TokenResponse:
        """
        Issue a new access token using a valid refresh token.

        Args:
            refresh_token_str: The refresh token to validate.

        Returns:
            New TokenResponse with fresh access and refresh tokens.

        Raises:
            HTTPException 401: If the refresh token is invalid or expired.
        """
        payload = verify_token_type(refresh_token_str, "refresh")
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "success": False,
                    "message": "Invalid or expired refresh token.",
                    "errors": [],
                },
            )

        user_uuid = payload.get("sub")
        user = self.db.query(User).filter(User.uuid == user_uuid).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "success": False,
                    "message": "User not found.",
                    "errors": [],
                },
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "message": "Account deactivated.",
                    "errors": [],
                },
            )

        token_data = {
            "sub": user.uuid,
            "email": user.email,
            "role": user.role.name if user.role else None,
            "user_id": user.id,
        }

        new_access = create_access_token(token_data)
        new_refresh = create_refresh_token(token_data)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
        )

    def change_password(
        self, user: User, data: ChangePasswordRequest
    ) -> dict:
        """
        Change the current user's password.

        Verifies the old password, then updates to the new hashed password.

        Args:
            user: The authenticated user model instance.
            data: Change password request with current and new passwords.

        Returns:
            Success message dictionary.

        Raises:
            HTTPException 400: If the current password is incorrect.
            HTTPException 400: If old and new passwords are the same.
        """
        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Current password is incorrect.",
                    "errors": [],
                },
            )

        if data.current_password == data.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "New password cannot be the same as the current password.",
                    "errors": [],
                },
            )

        user.hashed_password = hash_password(data.new_password)
        self.db.commit()

        logger.info("Password changed for user: %s (%s)", user.username, user.email)

        return {"success": True, "message": "Password changed successfully."}

    def forgot_password(self, data: ForgotPasswordRequest) -> dict:
        """
        Initiate the password reset flow.

        Generates a short-lived reset token and sends it via email.
        Always returns success to prevent email enumeration.

        Args:
            data: Forgot password request with user's email.

        Returns:
            Success message (always, to prevent email enumeration).
        """
        user = self.db.query(User).filter(User.email == data.email).first()

        if user:
            reset_token = create_reset_token(user.email)
            EmailService.send_reset_password_email(user.email, reset_token)
            logger.info("Password reset requested for: %s", user.email)
        else:
            logger.warning(
                "Password reset requested for non-existent email: %s", data.email
            )

        # Always return success to prevent email enumeration
        return {
            "success": True,
            "message": "If an account with that email exists, a reset link has been sent.",
        }

    def reset_password(self, data: ResetPasswordRequest) -> dict:
        """
        Reset the user's password using a valid reset token.

        Args:
            data: Reset password request with token and new password.

        Returns:
            Success message dictionary.

        Raises:
            HTTPException 400: If the reset token is invalid or expired.
            HTTPException 404: If the user associated with the token is not found.
        """
        payload = verify_token_type(data.token, "reset")
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Invalid or expired reset token.",
                    "errors": [],
                },
            )

        email = payload.get("sub")
        user = self.db.query(User).filter(User.email == email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "message": "User not found.",
                    "errors": [],
                },
            )

        user.hashed_password = hash_password(data.new_password)
        self.db.commit()

        logger.info("Password reset completed for: %s", user.email)

        return {"success": True, "message": "Password has been reset successfully."}

    def update_profile(
        self, user: User, data: ProfileUpdateRequest
    ) -> UserResponse:
        """
        Update the current user's profile information.

        Only updates fields that are explicitly provided (non-None).

        Args:
            user: The authenticated user model instance.
            data: Profile update request with optional fields.

        Returns:
            Updated UserResponse.
        """
        if data.phone_number is not None and not validate_phone_number(data.phone_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Invalid phone number format.",
                    "errors": ["Phone number format is invalid."],
                },
            )

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)

        logger.info("Profile updated for user: %s (%s)", user.username, user.email)

        return UserResponse.model_validate(user)
