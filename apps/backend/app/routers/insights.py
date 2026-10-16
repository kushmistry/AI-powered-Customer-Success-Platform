from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import get_cache, CacheService
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.repositories.insight_repo import InsightRepository
from app.schemas.insight import InsightResponse, InsightGenerateRequest
from app.schemas.common import ApiResponse, success_response
from app.services.interaction_service import InteractionService

router = APIRouter(prefix="/api/interactions/{interaction_id}/insights", tags=["AI Insights"])


@router.get("", response_model=ApiResponse[InsightResponse])
async def get_interaction_insight(
    interaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Fetch existing AI insight for an interaction."""
    insight_repo = InsightRepository(db)
    insight = await insight_repo.get_by_interaction_id(interaction_id)
    if not insight:
        # If none exists yet, generate it on demand
        service = InteractionService(db, cache)
        insight, _ = await service.generate_insight(interaction_id)
    return success_response(data=insight, message="AI insight retrieved successfully")


@router.post("", response_model=ApiResponse[InsightResponse], status_code=status.HTTP_200_OK)
async def generate_interaction_insight(
    interaction_id: str,
    request: InsightGenerateRequest = InsightGenerateRequest(),
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Generate or re-generate structured AI insights from meeting notes using Google Gemini. Requires Admin or Manager."""
    service = InteractionService(db, cache)
    insight, message = await service.generate_insight(interaction_id, custom_notes=request.custom_notes)
    return success_response(data=insight, message=message)

