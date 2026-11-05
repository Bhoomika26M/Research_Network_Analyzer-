"""Audit-log helper shared by write endpoints.

Deletion/removal actions record an entry in ``audit_logs`` so destructive
operations are traceable (see app/models/audit.py). The log row is added to
the caller's transaction and committed together with the action itself.
"""
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from src.models.audit import AuditLog


async def record_audit(
    db: AsyncSession,
    actor: str,
    action: str,
    target: str,
    category: str = "Data",
) -> AuditLog:
    """Add an audit-log entry (uncommitted) describing an action by ``actor``.

    The text columns are String(255), so long titles/names are truncated to
    keep the row insertable.
    """
    log = AuditLog(
        actor=actor[:255],
        action=action[:255],
        target=target[:255],
        timestamp=datetime.utcnow().isoformat(),
        category=category,
    )
    db.add(log)
    return log
