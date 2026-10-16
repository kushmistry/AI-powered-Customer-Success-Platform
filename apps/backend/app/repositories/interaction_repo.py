from datetime import datetime
from typing import List, Optional, Dict
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.interaction import Interaction
from app.repositories.base import BaseRepository


class InteractionRepository(BaseRepository[Interaction]):
    def __init__(self, session: AsyncSession):
        super().__init__(Interaction, session)

    async def get_by_id_with_relations(self, id: str) -> Optional[Interaction]:
        """Fetch interaction with eager-loaded customer and AI insight."""
        stmt = (
            select(Interaction)
            .where(Interaction.id == id)
            .options(
                selectinload(Interaction.customer),
                selectinload(Interaction.insight),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_filtered(
        self,
        skip: int = 0,
        limit: int = 20,
        customer_id: Optional[str] = None,
        type: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> List[Interaction]:
        """Fetch filtered interactions with customer and insight attached."""
        stmt = (
            select(Interaction)
            .options(
                selectinload(Interaction.customer),
                selectinload(Interaction.insight),
            )
        )
        if customer_id and customer_id.strip():
            stmt = stmt.where(Interaction.customer_id == customer_id.strip())
        if type and type.strip():
            stmt = stmt.where(Interaction.type == type.strip().lower())
        if date_from:
            stmt = stmt.where(Interaction.interaction_date >= date_from)
        if date_to:
            stmt = stmt.where(Interaction.interaction_date <= date_to)

        stmt = stmt.order_by(Interaction.interaction_date.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count_filtered(
        self,
        customer_id: Optional[str] = None,
        type: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> int:
        """Count interactions matching filters."""
        stmt = select(func.count()).select_from(Interaction)
        if customer_id and customer_id.strip():
            stmt = stmt.where(Interaction.customer_id == customer_id.strip())
        if type and type.strip():
            stmt = stmt.where(Interaction.type == type.strip().lower())
        if date_from:
            stmt = stmt.where(Interaction.interaction_date >= date_from)
        if date_to:
            stmt = stmt.where(Interaction.interaction_date <= date_to)
        result = await self.session.execute(stmt)
        return result.scalar_one() or 0

    async def get_recent(self, limit: int = 5) -> List[Interaction]:
        """Fetch most recent interactions for the dashboard."""
        stmt = (
            select(Interaction)
            .options(
                selectinload(Interaction.customer),
                selectinload(Interaction.insight),
            )
            .order_by(Interaction.interaction_date.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_type_counts(self) -> Dict[str, int]:
        """Aggregate interaction count by type."""
        stmt = select(Interaction.type, func.count(Interaction.id)).group_by(Interaction.type)
        result = await self.session.execute(stmt)
        counts = {"meeting": 0, "call": 0, "email": 0}
        for type_name, count in result.all():
            counts[type_name] = count
        return counts

