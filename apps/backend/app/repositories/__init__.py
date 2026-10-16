from app.repositories.base import BaseRepository
from app.repositories.user_repo import UserRepository
from app.repositories.customer_repo import CustomerRepository
from app.repositories.interaction_repo import InteractionRepository
from app.repositories.insight_repo import InsightRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "CustomerRepository",
    "InteractionRepository",
    "InsightRepository",
]

