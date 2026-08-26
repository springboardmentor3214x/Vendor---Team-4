from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.file_share import FileShareCreate, FileShareResponse
from app.services import file_share_service

router = APIRouter(prefix="/files", tags=["File Sharing"])

UPLOAD_DIR = Path("uploads") / "communication"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/", response_model=FileShareResponse)
def create_file(
    file: FileShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file.uploaded_by = current_user.id
    try:
        return file_share_service.create_file_share(db, file)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/upload", response_model=FileShareResponse)
async def upload_file(
    file: UploadFile = File(...),
    vendor_id: int | None = Form(None),
    purchase_order_id: int | None = Form(None),
    discussion_id: int | None = Form(None),
    contract_id: int | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A file is required.")

    safe_name = Path(file.filename).name
    stored_name = f"{uuid4().hex}_{safe_name}"
    destination = UPLOAD_DIR / stored_name

    try:
        with destination.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                output.write(chunk)
    except Exception as exc:
        if destination.exists():
            destination.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Unable to store file: {exc}")

    extension = Path(safe_name).suffix.lstrip(".").upper() or "DOCUMENT"
    data = FileShareCreate(
        file_name=safe_name,
        file_path=str(destination),
        file_type=extension,
        uploaded_by=current_user.id,
        vendor_id=vendor_id,
        purchase_order_id=purchase_order_id,
        discussion_id=discussion_id,
        contract_id=contract_id
    )

    try:
        return file_share_service.create_file_share(db, data)
    except ValueError as exc:
        destination.unlink(missing_ok=True)
        raise HTTPException(status_code=404, detail=str(exc))

@router.get("/", response_model=list[FileShareResponse])
def get_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return file_share_service.get_files(db)

@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = file_share_service.get_file(db, file_id)
    if not record:
        raise HTTPException(status_code=404, detail="File not found")

    path = Path(record.file_path)
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Stored file is missing")

    return FileResponse(
        path=str(path),
        filename=record.file_name,
        media_type="application/octet-stream"
    )

@router.get("/{file_id}", response_model=FileShareResponse)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = file_share_service.get_file(db, file_id)
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    return record

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = file_share_service.get_file(db, file_id)
    if not record:
        raise HTTPException(status_code=404, detail="File not found")

    stored_path = Path(record.file_path)
    deleted = file_share_service.delete_file(db, file_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="File not found")

    stored_path.unlink(missing_ok=True)
    return {"message": "File deleted successfully"}
