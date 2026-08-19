from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    vendor: str
    reliability_score: float
    recommendation: str

    class Config:
        from_attributes = True