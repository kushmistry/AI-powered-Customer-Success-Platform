from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse, RefreshTokenRequest
from app.schemas.common import ApiResponse, success_response
from app.services.auth_service import AuthService
from app.services.email_service import email_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=ApiResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account and dispatch a welcome email in the background."""
    service = AuthService(db)
    result = await service.register(user_in)

    # Dispatch welcome email asynchronously via FastAPI BackgroundTasks
    background_tasks.add_task(
        email_service.send_welcome_email,
        to_email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role or "viewer",
    )

    return success_response(data=result, message="User registered successfully")


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password to receive JWT tokens."""
    service = AuthService(db)
    token_data = await service.login(credentials)
    return success_response(data=token_data, message="Login successful")


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_tokens(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for fresh access and refresh tokens."""
    service = AuthService(db)
    token_data = await service.refresh_tokens(payload.refresh_token)
    return success_response(data=token_data, message="Token refreshed successfully")



@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_profile(current_user: User = Depends(get_current_user)):
    """Get the currently logged-in user profile."""
    return success_response(data=current_user, message="Profile retrieved successfully")


@router.put("/me", response_model=ApiResponse[UserResponse])
async def update_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile information."""
    service = AuthService(db)
    updated_user = await service.update_profile(current_user.id, update_in)
    return success_response(data=updated_user, message="Profile updated successfully")
