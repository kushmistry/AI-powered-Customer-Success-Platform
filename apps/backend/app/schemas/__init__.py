from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.schemas.interaction import InteractionCreate, InteractionUpdate, InteractionResponse, InteractionListResponse
from app.schemas.insight import InsightResponse, InsightGenerateRequest
from app.schemas.dashboard import DashboardMetricsResponse, MonthlyTrend

from app.schemas.common import ApiResponse, PaginationMeta, success_response

__all__ = [
    "ApiResponse",
    "PaginationMeta",
    "success_response",
    "UserCreate",
    "UserLogin",
    "UserUpdate",
    "UserResponse",
    "TokenResponse",
    "CustomerCreate",
    "CustomerUpdate",
    "CustomerResponse",
    "CustomerListResponse",
    "InteractionCreate",
    "InteractionUpdate",
    "InteractionResponse",
    "InteractionListResponse",
    "InsightResponse",
    "InsightGenerateRequest",
    "DashboardMetricsResponse",
    "MonthlyTrend",
]

