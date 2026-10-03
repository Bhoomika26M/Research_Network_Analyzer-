import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.redis import close_redis_client
from src.db.session import AsyncSessionLocal
from src.db.init_db import init_db
from src.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up FastAPI Scientific Collaboration Network API...")
    # Initialize DB Seed data if needed
    async with AsyncSessionLocal() as session:
        try:
            await init_db(session)
        except Exception as e:
            logger.warning(f"Could not auto-seed database: {e}")
    yield
    logger.info("Shutting down FastAPI API...")
    await close_redis_client()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set CORS origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


# Include V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)
