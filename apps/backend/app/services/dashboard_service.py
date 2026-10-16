from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import CacheService
from app.repositories.customer_repo import CustomerRepository
from app.repositories.interaction_repo import InteractionRepository
from app.repositories.insight_repo import InsightRepository


class DashboardService:
    def __init__(self, db: AsyncSession, cache: CacheService):
        self.db = db
        self.cache = cache
        self.customer_repo = CustomerRepository(db)
        self.interaction_repo = InteractionRepository(db)
        self.insight_repo = InsightRepository(db)

    async def get_metrics(self) -> Dict[str, Any]:
        """Fetch aggregated metrics for the dashboard with Redis caching."""
        cache_key = "dashboard:metrics"

        # 1. Try Redis cache (2 minutes TTL)
        cached = await self.cache.get(cache_key)
        if cached is not None:
            return cached

        # 2. Compute metrics from repositories
        total_customers = await self.customer_repo.count()
        total_interactions = await self.interaction_repo.count()

        status_counts = await self.customer_repo.get_status_counts()
        type_counts = await self.interaction_repo.get_type_counts()
        sentiment_counts = await self.insight_repo.get_sentiment_counts()
        recent_interactions = await self.interaction_repo.get_recent(limit=5)

        # Monthly mock trend (or last 6 months)
        months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
        monthly_trend = [
            {"month": m, "interactions": max(1, (i + 1) * 3 + (total_interactions % 5)), "customers": max(1, (i + 1) * 2 + (total_customers % 3))}
            for i, m in enumerate(months)
        ]

        result = {
            "total_customers": total_customers,
            "total_interactions": total_interactions,
            "customers_by_status": status_counts,
            "interactions_by_type": type_counts,
            "sentiment_distribution": sentiment_counts,
            "recent_interactions": [
                {
                    "id": item.id,
                    "customer_id": item.customer_id,
                    "created_by": item.created_by,
                    "type": item.type,
                    "subject": item.subject,
                    "notes": item.notes,
                    "interaction_date": item.interaction_date.isoformat() if item.interaction_date else None,
                    "created_at": item.created_at.isoformat() if item.created_at else None,
                    "customer": {
                        "id": item.customer.id,
                        "name": item.customer.name,
                        "email": item.customer.email,
                        "company": item.customer.company,
                        "status": item.customer.status,
                        "created_at": item.customer.created_at.isoformat() if getattr(item.customer, "created_at", None) else None,
                    } if item.customer else None,
                    "insight": {
                        "id": item.insight.id,
                        "interaction_id": getattr(item.insight, "interaction_id", None) or item.id,
                        "summary": item.insight.summary,
                        "sentiment": item.insight.sentiment,
                        "action_items": item.insight.action_items,
                        "key_risks": item.insight.key_risks,
                        "generated_at": item.insight.generated_at.isoformat() if item.insight.generated_at else None,
                    } if item.insight else None,
                }
                for item in recent_interactions
            ],
            "monthly_trend": monthly_trend,
        }

        # 3. Store in cache for 120 seconds
        await self.cache.set(cache_key, result, ttl=120)

        return result

