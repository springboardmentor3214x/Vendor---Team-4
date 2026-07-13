"""
User management service.

Handles CRUD operations for user administration.
Used by admin-level endpoints for managing all platform users.
"""

import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.role import Role
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.utils.password import hash_password
from app.utils.validators import validate_phone_number, validate_username

logger = logging.getLogger("vrip.users")


class UserService:
    """Service class for user CRUD operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_users(
        self, page: int = 1, per_page: int = 20, search: str | None = None
    ) -> tuple[list[User], int]:
        """
        List users with pagination and optional search.

        Args:
            page: Page number (1-indexed).
            per_page: Number of results per page.
            search: Optional search string to filter by name, email, or username.

        Returns:
            Tuple of (list of User models, total count).
        """
        query = self.db.query(User)

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (User.first_name.ilike(search_filter))
                | (User.last_name.ilike(search_filter))
                | (User.email.ilike(search_filter))
                | (User.username.ilike(search_filter))
                | (User.company_name.ilike(search_filter))
            )

        total = query.count()
        users = (
            query.order_by(User.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        return users, total

    def get_user_by_id(self, user_id: int) -> User:
        """
        Fetch a single user by their database ID.

        Args:
            user_id: The user's integer primary key.

        Returns:
            The User model instance.

        Raises:
            HTTPException 404: If the user does not exist.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "message": "User not found.",
                    "errors": [f"No user exists with ID {user_id}."],
                },
            )
        return user

    def get_user_by_uuid(self, user_uuid: str) -> User:
        """
        Fetch a single user by their UUID.

        Args:
            user_uuid: The user's UUID string.

        Returns:
            The User model instance.

        Raises:
            HTTPException 404: If the user does not exist.
        """
        user = self.db.query(User).filter(User.uuid == user_uuid).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "message": "User not found.",
                    "errors": [f"No user exists with UUID {user_uuid}."],
                },
            )
        return user

    def create_user(self, data: UserCreate) -> UserResponse:
        """
        Create a new user (admin operation).

        Args:
            data: User creation payload.

        Returns:
            UserResponse with the created user's data.

        Raises:
            HTTPException 400: On validation or uniqueness errors.
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

        # Validate phone number
        if data.phone_number and not validate_phone_number(data.phone_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Invalid phone number format.",
                    "errors": ["Phone number format is invalid."],
                },
            )

        # Check duplicate email
        if self.db.query(User).filter(User.email == data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Email already registered.",
                    "errors": [f"A user with email '{data.email}' already exists."],
                },
            )

        # Check duplicate username
        if self.db.query(User).filter(User.username == data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Username already taken.",
                    "errors": [
                        f"A user with username '{data.username}' already exists."
                    ],
                },
            )

        # Resolve role
        role = self.db.query(Role).filter(Role.name == data.role_name).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": f"Role '{data.role_name}' does not exist.",
                    "errors": [],
                },
            )

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
            is_active=data.is_active,
            is_verified=data.is_verified,
            is_superuser=False,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        logger.info("Admin created user: %s (%s)", user.username, user.email)

        return UserResponse.model_validate(user)

    def update_user(self, user_id: int, data: UserUpdate) -> UserResponse:
        """
        Update an existing user (admin operation).

        Only updates fields that are explicitly set (non-None).

        Args:
            user_id: The user's database ID.
            data: Partial user update payload.

        Returns:
            Updated UserResponse.

        Raises:
            HTTPException 404: If the user does not exist.
            HTTPException 400: If the specified role does not exist.
        """
        user = self.get_user_by_id(user_id)

        update_data = data.model_dump(exclude_unset=True)

        # If changing role, resolve role_name to role_id
        if "role_name" in update_data:
            role_name = update_data.pop("role_name")
            if role_name is not None:
                role = self.db.query(Role).filter(Role.name == role_name).first()
                if not role:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={
                            "success": False,
                            "message": f"Role '{role_name}' does not exist.",
                            "errors": [],
                        },
                    )
                user.role_id = role.id

        # Validate phone if being updated
        if "phone_number" in update_data and update_data["phone_number"]:
            if not validate_phone_number(update_data["phone_number"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "success": False,
                        "message": "Invalid phone number format.",
                        "errors": [],
                    },
                )

        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)

        logger.info("Admin updated user: %s (ID: %d)", user.username, user.id)

        return UserResponse.model_validate(user)

    def delete_user(self, user_id: int) -> dict:
        """
        Soft-delete a user by deactivating their account.

        Sets `is_active = False` rather than removing the record.

        Args:
            user_id: The user's database ID.

        Returns:
            Success message dictionary.

        Raises:
            HTTPException 404: If the user does not exist.
            HTTPException 400: If attempting to delete a superuser.
        """
        user = self.get_user_by_id(user_id)

        if user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Cannot delete the system administrator.",
                    "errors": [],
                },
            )

        user.is_active = False
        self.db.commit()

        logger.info("User soft-deleted: %s (ID: %d)", user.username, user.id)

        return {"success": True, "message": f"User '{user.username}' has been deactivated."}

    def activate_user(self, user_id: int) -> UserResponse:
        """
        Activate a user account.

        Args:
            user_id: The user's database ID.

        Returns:
            Updated UserResponse.
        """
        user = self.get_user_by_id(user_id)
        user.is_active = True
        self.db.commit()
        self.db.refresh(user)

        logger.info("User activated: %s (ID: %d)", user.username, user.id)

        return UserResponse.model_validate(user)

    def deactivate_user(self, user_id: int) -> UserResponse:
        """
        Deactivate a user account.

        Args:
            user_id: The user's database ID.

        Returns:
            Updated UserResponse.

        Raises:
            HTTPException 400: If attempting to deactivate a superuser.
        """
        user = self.get_user_by_id(user_id)

        if user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Cannot deactivate the system administrator.",
                    "errors": [],
                },
            )

        user.is_active = False
        self.db.commit()
        self.db.refresh(user)

        logger.info("User deactivated: %s (ID: %d)", user.username, user.id)

        return UserResponse.model_validate(user)
