from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.auth import get_current_user

from app.schemas.recommendation import RecommendationResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/recommendation",
    tags=["Recommendation Engine"]
)


@router.get(
    "/{vendor_id}",
    response_model=RecommendationResponse
)
def get_recommendation(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return RecommendationService.get_recommendation(
        db,
        vendor_id
    )