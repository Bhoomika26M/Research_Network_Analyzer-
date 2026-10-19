"""Helper for writing rows into audit_logs (login, role change, etc.)."""

import uuid

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.models.enums import AuditCategory


def client_ip(request: Request) -> str | None:
    """Best-effort client IP (honours X-Forwarded-For when behind a proxy)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


async def write_audit_log(
    db: AsyncSession,
    *,
    action: str,
    category: AuditCategory,
    user_id: uuid.UUID | None = None,
    entity_type: str = "user",
    entity_id: uuid.UUID | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """Add an audit_logs row; it commits with the request's transaction."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        category=category,
        details=details,
        ip_address=ip_address,
    )
    db.add(log)
    await db.flush()
    return log
