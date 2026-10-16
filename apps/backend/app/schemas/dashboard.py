from typing import Dict, List
from pydantic import BaseModel
from app.schemas.interaction import InteractionResponse


class MonthlyTrend(BaseModel):
    month: str
    interactions: int
    customers: int


class DashboardMetricsResponse(BaseModel):
    total_customers: int
    total_interactions: int
    customers_by_status: Dict[str, int]
    interactions_by_type: Dict[str, int]
    sentiment_distribution: Dict[str, int]
    recent_interactions: List[InteractionResponse]
    monthly_trend: List[MonthlyTrend]

