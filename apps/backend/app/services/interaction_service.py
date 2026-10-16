import asyncio
import logging
import math
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import CacheService
from app.models.interaction import Interaction
from app.models.insight import AIInsight
from app.models.user import User
from app.repositories.customer_repo import CustomerRepository
from app.repositories.interaction_repo import InteractionRepository
from app.repositories.insight_repo import InsightRepository
from app.schemas.interaction import InteractionCreate, InteractionUpdate
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class InteractionService:
    def __init__(self, db: AsyncSession, cache: CacheService):
        self.db = db
        self.cache = cache
        self.interaction_repo = InteractionRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.insight_repo = InsightRepository(db)

    async def get_interactions(
        self,
        page: int = 1,
        size: int = 20,
        customer_id: Optional[str] = None,
        interaction_type: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Fetch filtered and paginated interactions."""
        skip = (page - 1) * size
        items = await self.interaction_repo.get_filtered(
            skip=skip,
            limit=size,
            customer_id=customer_id,
            type=interaction_type,
            date_from=date_from,
            date_to=date_to,
        )
        total = await self.interaction_repo.count_filtered(
            customer_id=customer_id,
            type=interaction_type,
            date_from=date_from,
            date_to=date_to,
        )

        pages = math.ceil(total / size) if size > 0 else 1

        return {
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
        }

    async def get_interaction_by_id(self, interaction_id: str) -> Interaction:
        """Fetch single interaction with related customer and AI insight."""
        interaction = await self.interaction_repo.get_by_id_with_relations(interaction_id)
        if not interaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interaction with ID '{interaction_id}' not found",
            )
        return interaction

    async def create_interaction(
        self, data_in: InteractionCreate, creator: User
    ) -> Tuple[Interaction, str]:
        """Create new interaction and optionally generate AI insights. Returns (saved_interaction, response_message)."""
        # Verify customer exists
        customer = await self.customer_repo.get_by_id(data_in.customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID '{data_in.customer_id}' does not exist",
            )

        interaction_date = data_in.interaction_date or datetime.now(timezone.utc)
        obj_data = {
            "customer_id": data_in.customer_id,
            "created_by": creator.id,
            "type": data_in.type,
            "subject": data_in.subject,
            "notes": data_in.notes,
            "interaction_date": interaction_date,
        }

        # 1. ALWAYS persist interaction first so data is safely saved
        interaction = await self.interaction_repo.create(obj_data)

        # 2. Trigger AI insight generation if requested with timeout protection
        message = "Interaction recorded successfully."
        if data_in.auto_generate_insights and data_in.notes:
            try:
                # Limit total AI wait to 8.0s so client requests never timeout or get cancelled
                _, is_ai_generated = await asyncio.wait_for(
                    self._generate_and_save_insight(interaction.id, data_in.notes, data_in.subject),
                    timeout=8.0,
                )
                if is_ai_generated:
                    message = "Interaction saved and AI insights generated successfully."
                else:
                    message = "Interaction saved successfully. (AI analysis used fallback heuristics due to high model traffic)."
            except asyncio.TimeoutError:
                logger.warning(
                    f"AI insight generation timed out for interaction {interaction.id}. Data saved safely."
                )
                message = "Interaction saved successfully, but AI insight generation took too long. You can generate insights anytime from the interaction details page."
            except Exception as e:
                logger.warning(
                    f"AI insight generation failed for interaction {interaction.id}: {e}. Data saved safely."
                )
                message = "Interaction saved successfully, but AI insights could not be generated at this time. You can generate them from the interaction details page."

        # Invalidate dashboard metrics cache
        await self.cache.delete("dashboard:metrics")

        # Reload with relations
        saved = await self.get_interaction_by_id(interaction.id)
        return saved, message

    async def update_interaction(
        self, interaction_id: str, data_in: InteractionUpdate
    ) -> Interaction:
        """Update existing interaction."""
        update_data = data_in.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_interaction_by_id(interaction_id)

        interaction = await self.interaction_repo.update(interaction_id, update_data)
        if not interaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interaction with ID '{interaction_id}' not found",
            )

        await self.cache.delete("dashboard:metrics")
        return await self.get_interaction_by_id(interaction_id)

    async def generate_insight(
        self, interaction_id: str, custom_notes: Optional[str] = None
    ) -> Tuple[AIInsight, str]:
        """Explicitly generate or regenerate AI insights for an interaction."""
        interaction = await self.interaction_repo.get_by_id(interaction_id)
        if not interaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interaction with ID '{interaction_id}' not found",
            )

        notes_to_analyze = custom_notes if custom_notes else interaction.notes
        try:
            insight, is_ai_generated = await asyncio.wait_for(
                self._generate_and_save_insight(interaction.id, notes_to_analyze, interaction.subject),
                timeout=7.0,
            )
            if is_ai_generated:
                msg = "AI insights generated successfully using Google Gemini."
            else:
                msg = "AI model currently busy. Generated using fallback heuristics."
            return insight, msg
        except (asyncio.TimeoutError, Exception) as e:
            logger.warning(
                f"AI generation timed out/failed for interaction {interaction_id}: {e}. Saving fallback heuristics."
            )
            fallback_data = ai_service._generate_fallback(notes_to_analyze, interaction.subject)
            existing_insight = await self.insight_repo.get_by_interaction_id(interaction_id)
            if existing_insight:
                saved = await self.insight_repo.update(
                    existing_insight.id,
                    {
                        "summary": fallback_data["summary"],
                        "sentiment": fallback_data["sentiment"],
                        "action_items": fallback_data["action_items"],
                        "key_risks": fallback_data["key_risks"],
                        "generated_at": datetime.now(timezone.utc),
                    },
                )
            else:
                saved = await self.insight_repo.create(
                    {
                        "interaction_id": interaction_id,
                        "summary": fallback_data["summary"],
                        "sentiment": fallback_data["sentiment"],
                        "action_items": fallback_data["action_items"],
                        "key_risks": fallback_data["key_risks"],
                        "generated_at": datetime.now(timezone.utc),
                    }
                )
            await self.cache.delete("dashboard:metrics")
            return saved, "AI model currently busy. Generated using fallback heuristics."

    async def _generate_and_save_insight(
        self, interaction_id: str, notes: str, subject: str = ""
    ) -> Tuple[AIInsight, bool]:
        """Helper to generate AI output and persist to the database. Returns (insight, is_ai_generated)."""
        insight_data = await ai_service.generate_insight(notes, subject)
        is_ai_generated = insight_data.get("is_ai_generated", True)

        existing_insight = await self.insight_repo.get_by_interaction_id(interaction_id)
        if existing_insight:
            updated = await self.insight_repo.update(
                existing_insight.id,
                {
                    "summary": insight_data["summary"],
                    "sentiment": insight_data["sentiment"],
                    "action_items": insight_data["action_items"],
                    "key_risks": insight_data["key_risks"],
                    "generated_at": datetime.now(timezone.utc),
                },
            )
            await self.cache.delete("dashboard:metrics")
            return updated, is_ai_generated
        else:
            new_insight = await self.insight_repo.create(
                {
                    "interaction_id": interaction_id,
                    "summary": insight_data["summary"],
                    "sentiment": insight_data["sentiment"],
                    "action_items": insight_data["action_items"],
                    "key_risks": insight_data["key_risks"],
                    "generated_at": datetime.now(timezone.utc),
                }
            )
            await self.cache.delete("dashboard:metrics")
            return new_insight, is_ai_generated

