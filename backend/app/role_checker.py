from fastapi import Depends, HTTPException, status

from app.auth import get_current_user


class RoleChecker:

    def __init__(self, allowed_roles):
        self.allowed_roles = [
            role.strip().lower()
            for role in allowed_roles
        ]

    def __call__(
        self,
        current_user=Depends(get_current_user)
    ):

        user_role = current_user.role.strip().lower()

        if user_role not in self.allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this resource"
            )

        return current_user