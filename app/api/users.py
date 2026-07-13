"""
User management API routes.

Admin-level endpoints for listing, creating, updating,
deleting, activating, and deactivating users.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, require_read_access
from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get(
    "",
    response_model=dict,
    summary="List all users",
    description="Retrieve a paginated list of all users. Accessible by Administrator, Procurement Manager, Supply Chain Manager, Finance Officer, and Auditor.",
    responses={
        200: {
            "description": "Users retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Users retrieved successfully.",
                        "data": [],
                        "total": 0,
                        "page": 1,
                        "per_page": 20,
                    }
                }
            },
        },
        403: {"description": "Insufficient permissions."},
    },
)
def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Users per page"),
    search: str | None = Query(None, description="Search by name, email, username, or company"),
    current_user: User = Depends(require_read_access),
    db: Session = Depends(get_db),
) -> dict:
    """List all users with pagination and optional search."""
    service = UserService(db)
    users, total = service.get_users(page=page, per_page=per_page, search=search)

    user_responses = [UserResponse.model_validate(u).model_dump() for u in users]

    return {
        "success": True,
        "message": "Users retrieved successfully.",
        "data": user_responses,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get(
    "/{user_id}",
    response_model=dict,
    summary="Get user by ID",
    description="Retrieve a single user by their database ID. Administrators can view any user; other users can only view their own profile.",
    responses={
        200: {"description": "User retrieved successfully."},
        403: {"description": "Access denied."},
        404: {"description": "User not found."},
    },
)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """Get a user by their ID."""
    service = UserService(db)
    user = service.get_user_by_id(user_id)

    # Allow admins, superusers, and the user themselves
    is_admin = current_user.is_superuser or (
        current_user.role and current_user.role.name == "Administrator"
    )
    is_self = current_user.id == user_id
    has_read_access = current_user.role and current_user.role.name in [
        "Procurement Manager",
        "Supply Chain Manager",
        "Finance Officer",
        "Auditor",
    ]

    if not (is_admin or is_self or has_read_access):
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": "You do not have permission to view this user.",
                "errors": [],
            },
        )

    user_data = UserResponse.model_validate(user)
    return {
        "success": True,
        "message": "User retrieved successfully.",
        "data": user_data.model_dump(),
    }


@router.put(
    "/{user_id}",
    response_model=dict,
    summary="Update user",
    description="Update an existing user's details. Administrator only.",
    responses={
        200: {"description": "User updated successfully."},
        400: {"description": "Validation error."},
        403: {"description": "Insufficient permissions."},
        404: {"description": "User not found."},
    },
)
def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Update a user (admin only)."""
    service = UserService(db)
    user = service.update_user(user_id, data)
    return {
        "success": True,
        "message": "User updated successfully.",
        "data": user.model_dump(),
    }


@router.delete(
    "/{user_id}",
    response_model=dict,
    summary="Delete user",
    description="Soft-delete a user by deactivating their account. Administrator only.",
    responses={
        200: {"description": "User deactivated successfully."},
        400: {"description": "Cannot delete superuser."},
        403: {"description": "Insufficient permissions."},
        404: {"description": "User not found."},
    },
)
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Soft-delete a user (admin only)."""
    service = UserService(db)
    return service.delete_user(user_id)


@router.patch(
    "/{user_id}/activate",
    response_model=dict,
    summary="Activate user",
    description="Activate a deactivated user account. Administrator only.",
    responses={
        200: {"description": "User activated successfully."},
        403: {"description": "Insufficient permissions."},
        404: {"description": "User not found."},
    },
)
def activate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Activate a user account (admin only)."""
    service = UserService(db)
    user = service.activate_user(user_id)
    return {
        "success": True,
        "message": f"User '{user.username}' has been activated.",
        "data": user.model_dump(),
    }


@router.patch(
    "/{user_id}/deactivate",
    response_model=dict,
    summary="Deactivate user",
    description="Deactivate an active user account. Administrator only.",
    responses={
        200: {"description": "User deactivated successfully."},
        400: {"description": "Cannot deactivate superuser."},
        403: {"description": "Insufficient permissions."},
        404: {"description": "User not found."},
    },
)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Deactivate a user account (admin only)."""
    service = UserService(db)
    user = service.deactivate_user(user_id)
    return {
        "success": True,
        "message": f"User '{user.username}' has been deactivated.",
        "data": user.model_dump(),
    }
