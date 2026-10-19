"""Health check endpoint: verifies database connectivity."""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """Liveness/readiness probe: returns 200 while the database is reachable."""
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover - depends on live services
        db_status = f"error: {type(exc).__name__}"

    if db_status != "ok":
        overall, code = "error", status.HTTP_503_SERVICE_UNAVAILABLE
    else:
        overall, code = "ok", status.HTTP_200_OK

    return JSONResponse(
        status_code=code,
        content={
            "status": overall,
            "database": db_status,
            "version": settings.VERSION,
        },
    )
