"""
RBAC (Role-Based Access Control) dependencies for FastAPI.

Provides dependency factories to enforce role-based access on routes.
"""

from typing import Callable

from fastapi import Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.models.user import User


def require_roles(allowed_roles: list[str]) -> Callable[..., User]:
    """
    Dependency factory that restricts endpoint access to specific roles.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_roles(["Administrator"]))])
        def admin_endpoint():
            ...

    Or inject the user:
        @router.get("/admin-only")
        def admin_endpoint(user: User = Depends(require_roles(["Administrator"]))):
            ...

    Args:
        allowed_roles: List of role names that are permitted access.

    Returns:
        A FastAPI dependency function that returns the current user
        if they have one of the allowed roles.
    """

    def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.is_superuser:
            return current_user

        if current_user.role is None or current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "message": "You do not have permission to perform this action.",
                    "errors": [
                        f"Required role(s): {', '.join(allowed_roles)}. "
                        f"Your role: {current_user.role.name if current_user.role else 'None'}."
                    ],
                },
            )
        return current_user

    return role_checker


def require_self_or_admin(user_uuid: str) -> Callable[..., User]:
    """
    Dependency factory that allows access only if the user is accessing
    their own resource or is an Administrator.

    Usage:
        @router.get("/users/{user_uuid}")
        def get_user(
            user_uuid: str,
            current_user: User = Depends(require_self_or_admin(user_uuid))
        ):
            ...

    Note: This is typically used inline. See the users API for usage patterns.

    Args:
        user_uuid: The UUID of the resource owner.

    Returns:
        A dependency function that enforces self-or-admin access.
    """

    def checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.is_superuser:
            return current_user

        is_admin = current_user.role and current_user.role.name == "Administrator"
        is_self = current_user.uuid == user_uuid

        if not (is_admin or is_self):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "message": "You can only access your own resources.",
                    "errors": [],
                },
            )
        return current_user

    return checker


# Pre-built dependency instances for common role checks
require_admin = require_roles(["Administrator"])
require_admin_or_manager = require_roles([
    "Administrator",
    "Procurement Manager",
    "Supply Chain Manager",
])
require_read_access = require_roles([
    "Administrator",
    "Procurement Manager",
    "Supply Chain Manager",
    "Finance Officer",
    "Auditor",
])
