from typing import Generic, TypeVar, Optional, Any, Union
from pydantic import BaseModel

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int
    size: int
    total: int
    pages: int


class ApiResponse(BaseModel, Generic[T]):
    status: bool = True
    message: str = "Success"
    data: Optional[T] = None
    meta: Optional[PaginationMeta] = None

    class Config:
        from_attributes = True


def success_response(
    data: Any = None,
    message: str = "Success",
    meta: Optional[Union[PaginationMeta, dict]] = None,
) -> dict:
    meta_dict = None
    if isinstance(meta, dict):
        meta_dict = meta
    elif isinstance(meta, PaginationMeta):
        meta_dict = meta.model_dump()

    return {
        "status": True,
        "message": message,
        "data": data,
        "meta": meta_dict,
    }

