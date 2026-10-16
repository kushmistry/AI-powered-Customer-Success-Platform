from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.cache import cache_service
from app.core.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata
from app.routers import (
    auth_router,
    customers_router,
    interactions_router,
    insights_router,
    dashboard_router,
    users_router,
)

logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("e2m.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: initialize and tear down services."""
    logger.info(f"Starting {settings.APP_NAME}...")

    # 1. Connect Redis cache
    await cache_service.connect()

    # 2. Create tables if not existing (auto-bootstrap)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not auto-create tables: {e}. Alembic migrations may be required.")

    yield

    # Shutdown
    logger.info("Shutting down application...")
    await cache_service.close()
    await engine.dispose()
    logger.info("Application shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Customer Success Platform API with Google Gemini, Redis Caching, and RBAC",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(interactions_router)
app.include_router(insights_router)
app.include_router(dashboard_router)
app.include_router(users_router)


# Global Exception Handlers for Fixed Response Format
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": False,
            "message": str(exc.detail),
            "data": None,
            "meta": None,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        field = err.get("loc", [""])[-1]
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{field}: {msg}" if field else msg)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": False,
            "message": "; ".join(error_messages) if error_messages else "Validation error",
            "data": None,
            "meta": None,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error processing {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": False,
            "message": "Internal server error. Please try again later.",
            "data": None,
            "meta": None,
        },
    )


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": True,
        "message": "Service is online",
        "data": {
            "app": settings.APP_NAME,
            "docs": "/docs",
        },
        "meta": None,
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    redis_status = "connected" if cache_service.client else "disconnected"
    return {
        "status": True,
        "message": "System is healthy",
        "data": {
            "redis": redis_status,
            "debug": settings.DEBUG,
        },
        "meta": None,
    }

