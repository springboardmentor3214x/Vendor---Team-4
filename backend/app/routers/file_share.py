from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.file_share import (
    FileShareCreate,
    FileShareResponse
)

from app.services import file_share_service

router = APIRouter(
    prefix="/files",
    tags=["File Sharing"]
)


# ---------------------------------------------------
# Create File
# ---------------------------------------------------

@router.post(
    "/",
    response_model=FileShareResponse
)
def create_file(
    file: FileShareCreate,
    db: Session = Depends(get_db)
):

    try:

        return file_share_service.create_file_share(
            db,
            file
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ---------------------------------------------------
# Get All Files
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[FileShareResponse]
)
def get_files(
    db: Session = Depends(get_db)
):

    return file_share_service.get_files(db)


# ---------------------------------------------------
# Get File By ID
# ---------------------------------------------------

@router.get(
    "/{file_id}",
    response_model=FileShareResponse
)
def get_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    file = file_share_service.get_file(
        db,
        file_id
    )

    if not file:

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return file


# ---------------------------------------------------
# Delete File
# ---------------------------------------------------

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    deleted = file_share_service.delete_file(
        db,
        file_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return {
        "message": "File deleted successfully"
    }