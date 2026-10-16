from typing import Optional, Dict
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.insight import AIInsight
from app.repositories.base import BaseRepository


class InsightRepository(BaseRepository[AIInsight]):
    def __init__(self, session: AsyncSession):
        super().__init__(AIInsight, session)

    async def get_by_interaction_id(self, interaction_id: str) -> Optional[AIInsight]:
        """Fetch insight generated for an interaction."""
        stmt = select(AIInsight).where(AIInsight.interaction_id == interaction_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_by_interaction_id(self, interaction_id: str) -> bool:
        """Delete insight associated with an interaction."""
        stmt = delete(AIInsight).where(AIInsight.interaction_id == interaction_id)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0

    async def get_sentiment_counts(self) -> Dict[str, int]:
        """Aggregate counts by sentiment."""
        stmt = select(AIInsight.sentiment, func.count(AIInsight.id)).group_by(AIInsight.sentiment)
        result = await self.session.execute(stmt)
        counts = {"positive": 0, "neutral": 0, "negative": 0}
        for sentiment, count in result.all():
            counts[sentiment] = count
        return counts

