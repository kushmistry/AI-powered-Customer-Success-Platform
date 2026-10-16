import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.common import ApiResponse, success_response

router = APIRouter(prefix="/api/users", tags=["User Management"])


@router.get("", response_model=ApiResponse[List[UserResponse]])
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    """List all registered users with pagination. Requires Admin role."""
    user_repo = UserRepository(db)
    skip = (page - 1) * size
    users = await user_repo.get_all(skip=skip, limit=size)
    total = await user_repo.count()
    pages = math.ceil(total / size) if size > 0 else 1

    return success_response(
        data=users,
        meta={
            "page": page,
            "size": size,
            "total": total,
            "pages": pages,
        },
        message="Users retrieved successfully",
    )



@router.put("/{user_id}", response_model=ApiResponse[UserResponse])
async def update_user(
    user_id: str,
    update_in: UserUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Update any user profile or role. Requires Admin role."""
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found",
        )

    update_data = update_in.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        existing = await user_repo.get_by_email(update_data["email"])
        if existing and existing.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already in use by another account",
            )
        update_data["email"] = update_data["email"].lower().strip()

    updated = await user_repo.update(user_id, update_data)
    return success_response(data=updated, message="User updated successfully")


@router.delete("/{user_id}", response_model=ApiResponse[None], status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user account. Cannot delete self. Requires Admin role."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account",
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found",
        )

    await user_repo.delete(user_id)
    return success_response(data=None, message="User deleted successfully")

