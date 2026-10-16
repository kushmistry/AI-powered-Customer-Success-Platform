from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import get_cache, CacheService
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.schemas.interaction import InteractionCreate, InteractionUpdate, InteractionResponse
from app.schemas.common import ApiResponse, success_response
from app.services.interaction_service import InteractionService
from app.services.email_service import email_service

router = APIRouter(prefix="/api/interactions", tags=["Interactions"])


@router.get("", response_model=ApiResponse[List[InteractionResponse]])
async def list_interactions(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    type: Optional[str] = Query(None, description="Filter by type: meeting, call, email"),
    date_from: Optional[datetime] = Query(None, description="Start date filter"),
    date_to: Optional[datetime] = Query(None, description="End date filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """List interactions with optional filtering and pagination."""
    service = InteractionService(db, cache)
    result = await service.get_interactions(
        page=page,
        size=size,
        customer_id=customer_id,
        interaction_type=type,
        date_from=date_from,
        date_to=date_to,
    )
    return success_response(
        data=result["items"],
        meta={
            "page": result["page"],
            "size": result["size"],
            "total": result["total"],
            "pages": result["pages"],
        },
        message="Interactions retrieved successfully",
    )


@router.get("/{interaction_id}", response_model=ApiResponse[InteractionResponse])
async def get_interaction(
    interaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Fetch single interaction details with attached AI insight and customer."""
    service = InteractionService(db, cache)
    interaction = await service.get_interaction_by_id(interaction_id)
    return success_response(data=interaction, message="Interaction retrieved successfully")


@router.post("", response_model=ApiResponse[InteractionResponse], status_code=status.HTTP_201_CREATED)
async def create_interaction(
    interaction_in: InteractionCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """
    Create a new interaction. Automatically generates AI insights from notes if enabled.
    Dispatches background emails via FastAPI BackgroundTasks for meeting summaries and risk alerts.
    Requires Admin or Manager.
    """
    service = InteractionService(db, cache)
    interaction, message = await service.create_interaction(interaction_in, current_user)

    # Dispatch background emails if insights are generated
    if interaction.insight and interaction.customer:
        # 1. Send meeting insight email
        if interaction.customer.email:
            background_tasks.add_task(
                email_service.send_interaction_summary_email,
                to_email=interaction.customer.email,
                company=interaction.customer.company,
                subject_line=interaction.subject,
                summary=interaction.insight.summary,
                sentiment=interaction.insight.sentiment,
                action_items=interaction.insight.action_items,
            )

        # 2. If negative sentiment or risks detected, trigger urgent risk alert to the manager
        if interaction.insight.sentiment == "negative" or (interaction.insight.key_risks and len(interaction.insight.key_risks) > 0):
            background_tasks.add_task(
                email_service.send_risk_alert_email,
                to_email=current_user.email,
                company=interaction.customer.company,
                subject_line=interaction.subject,
                key_risks=interaction.insight.key_risks,
                sentiment=interaction.insight.sentiment,
            )

    return success_response(data=interaction, message=message)


@router.put("/{interaction_id}", response_model=ApiResponse[InteractionResponse])
async def update_interaction(
    interaction_id: str,
    interaction_in: InteractionUpdate,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Update an interaction. Requires Admin or Manager."""
    service = InteractionService(db, cache)
    interaction = await service.update_interaction(interaction_id, interaction_in)
    return success_response(data=interaction, message="Interaction updated successfully")
