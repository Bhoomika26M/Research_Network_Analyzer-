from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.db.session import get_db
from src.models.audit import AuditLog
from src.models.user import User
from src.schemas.audit import AuditLogResponse, AuditLogCreate

router = APIRouter()


@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("analytics.viewAuditLogs")),
) -> Any:
    result = await db.execute(select(AuditLog).order_by(AuditLog.id.desc()).limit(100))
    return result.scalars().all()


@router.post("/", response_model=AuditLogResponse)
async def create_audit_log(
    log_in: AuditLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("analytics.viewAuditLogs")),
) -> Any:
    log = AuditLog(**log_in.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
