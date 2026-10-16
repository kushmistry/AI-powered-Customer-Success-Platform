from datetime import datetime, timezone, timedelta
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator
from app.schemas.customer import CustomerResponse
from app.schemas.insight import InsightResponse


class InteractionBase(BaseModel):
    customer_id: str
    type: Literal["meeting", "call", "email"] = "meeting"
    subject: str = Field(..., min_length=2, max_length=255)
    notes: str = Field(..., min_length=5, max_length=10000)
    interaction_date: Optional[datetime] = None

    @field_validator("interaction_date")
    @classmethod
    def validate_no_future_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None:
            now = datetime.now(timezone.utc)
            v_tz = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
            # Allow up to 5 minutes tolerance for system clock differences
            if v_tz > now + timedelta(minutes=5):
                raise ValueError("Interaction date cannot be in the future")
        return v


class InteractionCreate(InteractionBase):
    auto_generate_insights: bool = True


class InteractionUpdate(BaseModel):
    type: Optional[Literal["meeting", "call", "email"]] = None
    subject: Optional[str] = Field(None, min_length=2, max_length=255)
    notes: Optional[str] = Field(None, min_length=5, max_length=10000)
    interaction_date: Optional[datetime] = None


class InteractionResponse(InteractionBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer: Optional[CustomerResponse] = None
    insight: Optional[InsightResponse] = None

    class Config:
        from_attributes = True


class InteractionListResponse(BaseModel):
    items: List[InteractionResponse]
    total: int
    page: int
    size: int
    pages: int

