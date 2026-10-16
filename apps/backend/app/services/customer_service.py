import math
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import CacheService
from app.models.customer import Customer
from app.models.user import User
from app.repositories.customer_repo import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: AsyncSession, cache: CacheService):
        self.db = db
        self.cache = cache
        self.repo = CustomerRepository(db)

    async def get_customers(
        self,
        page: int = 1,
        size: int = 20,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetch paginated customer list with Redis caching."""
        cache_key = f"customers:list:p={page}:s={size}:st={status_filter or 'all'}:q={search or 'none'}"

        # 1. Try cache
        cached_result = await self.cache.get(cache_key)
        if cached_result is not None:
            return cached_result

        # 2. Fetch from database
        skip = (page - 1) * size
        items = await self.repo.get_filtered(
            skip=skip,
            limit=size,
            status=status_filter,
            search=search,
        )
        total = await self.repo.count_filtered(
            status=status_filter,
            search=search,
        )

        pages = math.ceil(total / size) if size > 0 else 1

        result = {
            "items": [
                {
                    "id": c.id,
                    "name": c.name,
                    "email": c.email,
                    "phone": c.phone,
                    "company": c.company,
                    "status": c.status,
                    "created_by": c.created_by,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                }
                for c in items
            ],
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
        }

        # 3. Store in cache (5 minutes TTL)
        await self.cache.set(cache_key, result, ttl=300)
        return result

    async def get_customer_by_id(self, customer_id: str) -> Customer:
        """Fetch customer details by ID with Redis caching."""
        cache_key = f"customers:detail:{customer_id}"

        cached = await self.cache.get(cache_key)
        if cached is not None:
            return Customer(
                id=cached["id"],
                name=cached["name"],
                email=cached["email"],
                phone=cached.get("phone"),
                company=cached["company"],
                status=cached["status"],
                created_by=cached.get("created_by"),
            )

        customer = await self.repo.get_by_id(customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID '{customer_id}' not found",
            )

        # Cache single item
        await self.cache.set(
            cache_key,
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "company": customer.company,
                "status": customer.status,
                "created_by": customer.created_by,
            },
            ttl=300,
        )
        return customer

    async def create_customer(self, customer_in: CustomerCreate, creator: User) -> Customer:
        """Create a new customer and invalidate relevant caches."""
        data = customer_in.model_dump()
        data["created_by"] = creator.id

        customer = await self.repo.create(data)

        # Invalidate lists and dashboard metrics
        await self.cache.delete_pattern("customers:list:*")
        await self.cache.delete("dashboard:metrics")

        return customer

    async def update_customer(self, customer_id: str, update_in: CustomerUpdate) -> Customer:
        """Update customer details and invalidate cache."""
        data = update_in.model_dump(exclude_unset=True)
        if not data:
            return await self.get_customer_by_id(customer_id)

        customer = await self.repo.update(customer_id, data)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID '{customer_id}' not found",
            )

        # Invalidate cache for this specific customer, list queries, and dashboard
        await self.cache.delete(f"customers:detail:{customer_id}")
        await self.cache.delete_pattern("customers:list:*")
        await self.cache.delete("dashboard:metrics")

        return customer

    async def delete_customer(self, customer_id: str) -> bool:
        """Delete customer and invalidate all related caches."""
        deleted = await self.repo.delete(customer_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID '{customer_id}' not found",
            )

        # Invalidate cache
        await self.cache.delete(f"customers:detail:{customer_id}")
        await self.cache.delete_pattern("customers:list:*")
        await self.cache.delete_pattern("interactions:*")
        await self.cache.delete("dashboard:metrics")

        return True

