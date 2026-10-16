from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import get_cache, CacheService
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardMetricsResponse
from app.schemas.common import ApiResponse, success_response
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=ApiResponse[DashboardMetricsResponse])
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Fetch aggregated business metrics, trends, and recent interactions. Cached in Redis."""
    service = DashboardService(db, cache)
    metrics = await service.get_metrics()
    return success_response(data=metrics, message="Dashboard metrics retrieved successfully")

