from datetime import datetime
from typing import List, Literal
from pydantic import BaseModel, Field


class InsightBase(BaseModel):
    summary: str
    sentiment: Literal["positive", "neutral", "negative"] = "neutral"
    action_items: List[str] = Field(default_factory=list)
    key_risks: List[str] = Field(default_factory=list)


class InsightResponse(InsightBase):
    id: str
    interaction_id: str
    generated_at: datetime

    class Config:
        from_attributes = True


class InsightGenerateRequest(BaseModel):
    # Optional override for notes if re-generating
    custom_notes: str | None = None

