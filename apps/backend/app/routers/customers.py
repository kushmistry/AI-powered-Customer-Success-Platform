from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache import get_cache, CacheService
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.common import ApiResponse, success_response
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=ApiResponse[List[CustomerResponse]])
async def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status: active, inactive, churned"),
    search: Optional[str] = Query(None, description="Search term for name, email, or company"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """List customers with optional filtering, search, and pagination. Cached in Redis."""
    service = CustomerService(db, cache)
    result = await service.get_customers(page=page, size=size, status_filter=status, search=search)
    return success_response(
        data=result["items"],
        meta={
            "page": result["page"],
            "size": result["size"],
            "total": result["total"],
            "pages": result["pages"],
        },
        message="Customers retrieved successfully",
    )


@router.get("/{customer_id}", response_model=ApiResponse[CustomerResponse])
async def get_customer(
    customer_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Fetch customer details by ID."""
    service = CustomerService(db, cache)
    customer = await service.get_customer_by_id(customer_id)
    return success_response(data=customer, message="Customer retrieved successfully")


@router.post("", response_model=ApiResponse[CustomerResponse], status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_in: CustomerCreate,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Create a new customer. Requires Admin or Manager role."""
    service = CustomerService(db, cache)
    created = await service.create_customer(customer_in, current_user)
    return success_response(data=created, message="Customer created successfully")


@router.put("/{customer_id}", response_model=ApiResponse[CustomerResponse])
async def update_customer(
    customer_id: str,
    customer_in: CustomerUpdate,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Update customer details. Requires Admin or Manager role."""
    service = CustomerService(db, cache)
    updated = await service.update_customer(customer_id, customer_in)
    return success_response(data=updated, message="Customer updated successfully")


@router.delete("/{customer_id}", response_model=ApiResponse[None], status_code=status.HTTP_200_OK)
async def delete_customer(
    customer_id: str,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Delete a customer. Requires Admin or Manager role."""
    service = CustomerService(db, cache)
    await service.delete_customer(customer_id)
    return success_response(data=None, message=f"Customer '{customer_id}' deleted successfully")

