from datetime import date
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse
)
from app.models.contract import ContractStatus
from app.services import contract_service

router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)


# ---------------------------------------------------
# Create Contract
# ---------------------------------------------------

@router.post(
    "/",
    response_model=ContractResponse
)
def create_contract(
    contract: ContractCreate,
    db: Session = Depends(get_db)
):

    try:

        return contract_service.create_contract(
            db,
            contract
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )



@router.get("/{contract_id}/document")
def download_contract_document(contract_id:int, db:Session=Depends(get_db)):
    contract=contract_service.get_contract(db,contract_id)
    if not contract or not contract.document_path:
        raise HTTPException(status_code=404,detail="Contract document not found")
    path=Path(contract.document_path)
    if not path.exists():
        raise HTTPException(status_code=404,detail="Contract document file not found")
    return FileResponse(path, filename=path.name)


@router.post("/{contract_id}/document", response_model=ContractResponse)
def upload_contract_document(
    contract_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    contract = contract_service.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    allowed = {"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF, DOC and DOCX files are allowed")

    upload_dir = Path("uploads") / "contracts"
    upload_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "contract").suffix
    filename = f"contract_{contract_id}_{uuid4().hex}{suffix}"
    path = upload_dir / filename
    with path.open("wb") as output:
        while chunk := file.file.read(1024 * 1024):
            output.write(chunk)

    contract.document_path = str(path)
    db.commit()
    db.refresh(contract)
    return contract

# ---------------------------------------------------
# Get All Contracts
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[ContractResponse]
)
def get_contracts(
    db: Session = Depends(get_db)
):

    return contract_service.get_contracts(db)


# ---------------------------------------------------
# Get Contract By ID
# ---------------------------------------------------

@router.get(
    "/{contract_id}",
    response_model=ContractResponse
)
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db)
):

    contract = contract_service.get_contract(
        db,
        contract_id
    )

    if not contract:

        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


# ---------------------------------------------------
# Update Contract
# ---------------------------------------------------

@router.put(
    "/{contract_id}",
    response_model=ContractResponse
)
def update_contract(
    contract_id: int,
    contract: ContractUpdate,
    db: Session = Depends(get_db)
):

    updated = contract_service.update_contract(
        db,
        contract_id,
        contract
    )

    if not updated:

        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return updated


# ---------------------------------------------------
# Delete Contract
# ---------------------------------------------------

@router.delete("/{contract_id}")
def delete_contract(
    contract_id: int,
    db: Session = Depends(get_db)
):

    deleted = contract_service.delete_contract(
        db,
        contract_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return {
        "message": "Contract deleted successfully"
    }


# ---------------------------------------------------
# Expiring Contracts
# ---------------------------------------------------

@router.get("/expiring/")
def get_expiring_contracts(
    days: int = 30,
    db: Session = Depends(get_db)
):

    return contract_service.get_expiring_contracts(
        db,
        days
    )


# ---------------------------------------------------
# Renew Contract
# ---------------------------------------------------

@router.put("/{contract_id}/renew")
def renew_contract(
    contract_id: int,
    new_end_date: date,
    db: Session = Depends(get_db)
):

    contract = contract_service.renew_contract(
        db,
        contract_id,
        new_end_date
    )

    if not contract:

        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract

# ---------------------------------------------------
# Get Vendor Contracts
# ---------------------------------------------------

@router.get(
    "/vendor/{vendor_id}",
    response_model=list[ContractResponse]
)
def get_vendor_contracts(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    return contract_service.get_vendor_contracts(
        db,
        vendor_id
    )


# ---------------------------------------------------
# Get Expired Contracts
# ---------------------------------------------------

@router.get(
    "/expired/",
    response_model=list[ContractResponse]
)
def get_expired_contracts(
    db: Session = Depends(get_db)
):

    return contract_service.get_expired_contracts(db)


# ---------------------------------------------------
# Get Active Contracts
# ---------------------------------------------------

@router.get(
    "/active/",
    response_model=list[ContractResponse]
)
def get_active_contracts(
    db: Session = Depends(get_db)
):

    return contract_service.get_active_contracts(db)


# ---------------------------------------------------
# Update Contract Status
# ---------------------------------------------------

@router.patch(
    "/{contract_id}/status",
    response_model=ContractResponse
)
def update_status(
    contract_id: int,
    status: ContractStatus,
    db: Session = Depends(get_db)
):

    contract = contract_service.update_contract_status(
        db,
        contract_id,
        status
    )

    if not contract:

        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract