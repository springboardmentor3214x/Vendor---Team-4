from fastapi import Depends, HTTPException

from app.auth import get_current_user


class RoleChecker:

    def __init__(self, allowed_roles):

        self.allowed_roles = allowed_roles

    def __call__(self, current_user=Depends(get_current_user)):

        if current_user.role not in self.allowed_roles:

            raise HTTPException(
                status_code=403,
                detail="Access Denied"
            )

        return current_user