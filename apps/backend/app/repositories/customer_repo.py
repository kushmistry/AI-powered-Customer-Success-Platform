from typing import List, Optional, Dict
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.customer import Customer
from app.repositories.base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, session: AsyncSession):
        super().__init__(Customer, session)

    async def get_filtered(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Customer]:
        """Fetch filtered and paginated customers."""
        stmt = select(Customer)
        if status and status.strip():
            stmt = stmt.where(Customer.status == status.strip().lower())
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Customer.name.ilike(term),
                    Customer.company.ilike(term),
                    Customer.email.ilike(term),
                )
            )
        stmt = stmt.order_by(Customer.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count_filtered(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> int:
        """Count filtered customers matching criteria."""
        stmt = select(func.count()).select_from(Customer)
        if status and status.strip():
            stmt = stmt.where(Customer.status == status.strip().lower())
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Customer.name.ilike(term),
                    Customer.company.ilike(term),
                    Customer.email.ilike(term),
                )
            )
        result = await self.session.execute(stmt)
        return result.scalar_one() or 0

    async def get_status_counts(self) -> Dict[str, int]:
        """Aggregate customer count by status."""
        stmt = select(Customer.status, func.count(Customer.id)).group_by(Customer.status)
        result = await self.session.execute(stmt)
        counts = {"active": 0, "inactive": 0, "churned": 0}
        for status, count in result.all():
            if status in counts:
                counts[status] = count
            else:
                counts[status] = count
        return counts

