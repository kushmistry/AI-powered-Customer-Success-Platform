from app.routers.auth import router as auth_router
from app.routers.customers import router as customers_router
from app.routers.interactions import router as interactions_router
from app.routers.insights import router as insights_router
from app.routers.dashboard import router as dashboard_router
from app.routers.users import router as users_router

__all__ = [
    "auth_router",
    "customers_router",
    "interactions_router",
    "insights_router",
    "dashboard_router",
    "users_router",
]

