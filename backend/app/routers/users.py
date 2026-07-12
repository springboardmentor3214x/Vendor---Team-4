from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.auth import (
    get_current_user,
    hash_password,
    verify_password
)

from app.database import get_db

from app.role_checker import RoleChecker

from app.schemas.user import (
    UserProfileUpdate,
    UpdatePasswordRequest
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "mobile_number": current_user.mobile_number,
        "role": current_user.role,
        "employee_id": current_user.employee_id,
        "company_name": current_user.company_name
    }


@router.put("/me")
def update_profile(
    request: UserProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.full_name = request.full_name

    current_user.mobile_number = (
        request.mobile_number
    )

    db.commit()

    db.refresh(current_user)

    return {
        "message": "Profile updated successfully"
    }


@router.put("/me/password")
def update_password(
    request: UpdatePasswordRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not verify_password(
        request.current_password,
        current_user.hashed_password
    ):

        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    current_user.hashed_password = (
        hash_password(request.new_password)
    )

    db.commit()

    return {
        "message": "Password updated successfully"
    }


@router.get("/admin")
def admin_access(
    current_user=Depends(
        RoleChecker(["Administrator"])
    )
):

    return {
        "message": "Administrator access granted"
    }


@router.get("/procurement")
def procurement_access(
    current_user=Depends(
        RoleChecker(["Procurement Manager"])
    )
):

    return {
        "message":
        "Procurement Manager access granted"
    }


@router.get("/supply-chain")
def supply_chain_access(
    current_user=Depends(
        RoleChecker(["Supply Chain Manager"])
    )
):

    return {
        "message":
        "Supply Chain Manager access granted"
    }


@router.get("/vendor")
def vendor_access(
    current_user=Depends(
        RoleChecker(["Vendor"])
    )
):

    return {
        "message": "Vendor access granted"
    }


@router.get("/finance")
def finance_access(
    current_user=Depends(
        RoleChecker(["Finance Officer"])
    )
):

    return {
        "message": "Finance Officer access granted"
    }


@router.get("/auditor")
def auditor_access(
    current_user=Depends(
        RoleChecker(["Auditor"])
    )
):

    return {
        "message": "Auditor access granted"
    }