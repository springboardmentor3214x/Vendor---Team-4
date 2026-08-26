from pydantic import BaseModel


class HighRiskWarningResponse(BaseModel):
    vendor: str
    reliability_score: float
    risk_level: str
    warning: bool
    message: str

    class Config:
        from_attributes = True