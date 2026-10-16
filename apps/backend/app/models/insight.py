import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    interaction_id = Column(String(36), ForeignKey("interactions.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    summary = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False, default="neutral", index=True)  # positive, neutral, negative
    action_items = Column(JSON, nullable=False, default=list)  # list of strings
    key_risks = Column(JSON, nullable=False, default=list)  # list of strings
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    interaction = relationship("Interaction", back_populates="insight")

