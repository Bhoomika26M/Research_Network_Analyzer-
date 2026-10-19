"""Audit log browsing (system_admin only) with category/user/date filters."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_roles
from app.models.audit_log import AuditLog
from app.models.enums import AuditCategory
from app.models.user import User
from app.schemas import AuditLogListResponse, AuditLogOut

router = APIRouter(
    prefix="/api/v1/audit-logs",
    tags=["audit-logs"],
    dependencies=[Depends(require_roles("system_admin"))],
)


@router.get("", response_model=AuditLogListResponse)
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    category: AuditCategory | None = None,
    user_id: uuid.UUID | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
) -> AuditLogListResponse:
    """Newest-first audit trail, filterable by category, acting user and date range."""
    stmt = select(AuditLog)
    if category is not None:
        stmt = stmt.where(AuditLog.category == category)
    if user_id is not None:
        stmt = stmt.where(AuditLog.user_id == user_id)
    if date_from is not None:
        stmt = stmt.where(AuditLog.timestamp >= date_from)
    if date_to is not None:
        stmt = stmt.where(AuditLog.timestamp <= date_to)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    rows = (
        await db.execute(
            select(AuditLog, User.full_name, User.role)
            .outerjoin(User, User.id == AuditLog.user_id)
            .order_by(AuditLog.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
    ).all()
    items: list[AuditLogOut] = []
    for log, user_name, user_role in rows:
        item = AuditLogOut.model_validate(log)
        item.user_name = user_name
        item.user_role = str(user_role) if user_role is not None else None
        items.append(item)
    return AuditLogListResponse(items=items, total=total, skip=skip, limit=limit)
