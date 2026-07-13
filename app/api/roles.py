"""
Role management API routes.

Provides CRUD operations for roles.
Role listing is available to all authenticated users.
Creation, update, and deletion are restricted to Administrators.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.security import get_current_active_user
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleCreate, RoleResponse, RoleUpdate

logger = logging.getLogger("vrip.api.roles")

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.get(
    "",
    response_model=dict,
    summary="List all roles",
    description="Retrieve all available roles. Accessible by any authenticated user.",
    responses={
        200: {
            "description": "Roles retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Roles retrieved successfully.",
                        "data": [
                            {
                                "id": 1,
                                "uuid": "...",
                                "name": "Administrator",
                                "description": "Full system access.",
                                "is_active": True,
                                "created_at": "2025-01-01T00:00:00Z",
                                "updated_at": "2025-01-01T00:00:00Z",
                            }
                        ],
                    }
                }
            },
        }
    },
)
def list_roles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """List all roles."""
    roles = db.query(Role).order_by(Role.id).all()
    role_data = [RoleResponse.model_validate(r).model_dump() for r in roles]
    return {
        "success": True,
        "message": "Roles retrieved successfully.",
        "data": role_data,
    }


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new role",
    description="Create a new role. Administrator only.",
    responses={
        201: {
            "description": "Role created successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Role created successfully.",
                        "data": {
                            "id": 7,
                            "uuid": "...",
                            "name": "Quality Inspector",
                            "description": "Inspects vendor deliveries.",
                            "is_active": True,
                        },
                    }
                }
            },
        },
        400: {"description": "Role name already exists."},
        403: {"description": "Insufficient permissions."},
    },
)
def create_role(
    data: RoleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Create a new role (admin only)."""
    # Check for duplicate name
    existing = db.query(Role).filter(Role.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": f"Role '{data.name}' already exists.",
                "errors": [],
            },
        )

    role = Role(
        name=data.name,
        description=data.description,
    )
    db.add(role)
    db.commit()
    db.refresh(role)

    logger.info("Role created: '%s' by user '%s'", role.name, current_user.username)

    role_data = RoleResponse.model_validate(role)
    return {
        "success": True,
        "message": "Role created successfully.",
        "data": role_data.model_dump(),
    }


@router.put(
    "/{role_id}",
    response_model=dict,
    summary="Update a role",
    description="Update an existing role's name, description, or status. Administrator only.",
    responses={
        200: {"description": "Role updated successfully."},
        400: {"description": "Role name already exists."},
        403: {"description": "Insufficient permissions."},
        404: {"description": "Role not found."},
    },
)
def update_role(
    role_id: int,
    data: RoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Update an existing role (admin only)."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": "Role not found.",
                "errors": [f"No role exists with ID {role_id}."],
            },
        )

    update_data = data.model_dump(exclude_unset=True)

    # Check name uniqueness if being changed
    if "name" in update_data and update_data["name"] != role.name:
        existing = db.query(Role).filter(Role.name == update_data["name"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": f"Role '{update_data['name']}' already exists.",
                    "errors": [],
                },
            )

    for field, value in update_data.items():
        setattr(role, field, value)

    db.commit()
    db.refresh(role)

    logger.info(
        "Role updated: '%s' (ID: %d) by user '%s'",
        role.name,
        role.id,
        current_user.username,
    )

    role_data = RoleResponse.model_validate(role)
    return {
        "success": True,
        "message": "Role updated successfully.",
        "data": role_data.model_dump(),
    }


@router.delete(
    "/{role_id}",
    response_model=dict,
    summary="Delete a role",
    description="Delete a role. Cannot delete roles that have assigned users. Administrator only.",
    responses={
        200: {"description": "Role deleted successfully."},
        400: {"description": "Role has assigned users and cannot be deleted."},
        403: {"description": "Insufficient permissions."},
        404: {"description": "Role not found."},
    },
)
def delete_role(
    role_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    """Delete a role (admin only)."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": "Role not found.",
                "errors": [f"No role exists with ID {role_id}."],
            },
        )

    # Prevent deletion of roles with assigned users
    from app.models.user import User as UserModel

    user_count = db.query(UserModel).filter(UserModel.role_id == role_id).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": f"Cannot delete role '{role.name}'. {user_count} user(s) are assigned to this role.",
                "errors": ["Reassign all users to a different role before deleting."],
            },
        )

    role_name = role.name
    db.delete(role)
    db.commit()

    logger.info(
        "Role deleted: '%s' (ID: %d) by user '%s'",
        role_name,
        role_id,
        current_user.username,
    )

    return {
        "success": True,
        "message": f"Role '{role_name}' has been deleted.",
    }
