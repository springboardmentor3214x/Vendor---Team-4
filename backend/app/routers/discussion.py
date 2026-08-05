from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.discussion import (
    DiscussionCreate,
    DiscussionUpdate,
    DiscussionResponse
)

from app.services import discussion_service

router = APIRouter(
    prefix="/discussions",
    tags=["Discussions"]
)


# ---------------------------------------------------
# Create Discussion
# ---------------------------------------------------

@router.post(
    "/",
    response_model=DiscussionResponse
)
def create_discussion(
    data: DiscussionCreate,
    db: Session = Depends(get_db)
):

    discussion, error = discussion_service.create_discussion(
        db,
        data
    )

    if error:

        raise HTTPException(
            status_code=404,
            detail=error
        )

    return discussion


# ---------------------------------------------------
# Get All Discussions
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[DiscussionResponse]
)
def get_discussions(
    db: Session = Depends(get_db)
):

    return discussion_service.get_discussions(db)


# ---------------------------------------------------
# Get Discussion By ID
# ---------------------------------------------------

@router.get(
    "/{discussion_id}",
    response_model=DiscussionResponse
)
def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):

    discussion = discussion_service.get_discussion(
        db,
        discussion_id
    )

    if not discussion:

        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    return discussion


# ---------------------------------------------------
# Purchase Order Discussions
# ---------------------------------------------------

@router.get(
    "/purchase-order/{purchase_order_id}",
    response_model=list[DiscussionResponse]
)
def get_purchase_order_discussions(
    purchase_order_id: int,
    db: Session = Depends(get_db)
):

    return discussion_service.get_purchase_order_discussions(
        db,
        purchase_order_id
    )


# ---------------------------------------------------
# Update Discussion
# ---------------------------------------------------

@router.put(
    "/{discussion_id}",
    response_model=DiscussionResponse
)
def update_discussion(
    discussion_id: int,
    data: DiscussionUpdate,
    db: Session = Depends(get_db)
):

    discussion = discussion_service.update_discussion(
        db,
        discussion_id,
        data
    )

    if not discussion:

        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    return discussion


# ---------------------------------------------------
# Delete Discussion
# ---------------------------------------------------

@router.delete("/{discussion_id}")
def delete_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):

    deleted = discussion_service.delete_discussion(
        db,
        discussion_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    return {
        "message": "Discussion deleted successfully"
    }