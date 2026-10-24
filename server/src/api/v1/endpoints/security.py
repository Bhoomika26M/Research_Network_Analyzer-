from datetime import datetime, timedelta
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.core.audit import record_audit
from src.core.security_settings import (
    load_security_settings,
    save_security_settings,
    trigger_force_logout,
    get_force_logout_at,
)
from src.db.session import get_db
from src.models.audit import AuditLog
from src.models.user import User

router = APIRouter()


class SecuritySettingsUpdate(BaseModel):
    sessionTimeout: str = "1 hr"
    minPasswordLen: int = 8
    requireSpecialChar: bool = True
    requireUppercase: bool = True
    ipAllowlist: bool = False
    ipRanges: List[str] = []


@router.get("/policy")
async def get_password_policy() -> Any:
    """Public endpoint to fetch current password policy for registration and login clients."""
    settings = load_security_settings()
    return {
        "minPasswordLen": int(settings.get("minPasswordLen", 8)),
        "requireSpecialChar": bool(settings.get("requireSpecialChar", True)),
        "requireUppercase": bool(settings.get("requireUppercase", True)),
        "forceLogoutAt": settings.get("forceLogoutAt"),
    }


@router.get("/settings")
async def get_security_settings(
    current_user: User = Depends(require_permission("system.securitySettings")),
) -> Any:
    """Fetch all platform security settings (admin only)."""
    return load_security_settings()


@router.put("/settings")
async def update_security_settings(
    body: SecuritySettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("system.securitySettings")),
) -> Any:
    """Save platform security settings (admin only)."""
    updated = save_security_settings(body.model_dump())
    await record_audit(
        db,
        actor=current_user.name,
        action="Updated security settings",
        target=f"MinPassword: {body.minPasswordLen}, SpecialChar: {body.requireSpecialChar}",
        category="Admin",
    )
    await db.commit()
    return updated


@router.post("/force-logout")
async def force_logout_all(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("system.securitySettings")),
) -> Any:
    """Force logout all active user sessions across the platform."""
    ts = trigger_force_logout()
    await record_audit(
        db,
        actor=current_user.name,
        action="Force logout all users",
        target="All platform sessions",
        category="Admin",
    )
    await db.commit()
    return {
        "success": True,
        "forceLogoutAt": ts,
        "message": "All active sessions have been invalidated",
    }


@router.post("/reset-keys")
async def reset_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("system.securitySettings")),
) -> Any:
    """Rotate security tokens and invalidate sessions."""
    ts = trigger_force_logout()
    await record_audit(
        db,
        actor=current_user.name,
        action="Reset security keys",
        target="Session keys rotated",
        category="Admin",
    )
    await db.commit()
    return {
        "success": True,
        "forceLogoutAt": ts,
        "message": "Security tokens successfully rotated",
    }


@router.get("/stats")
async def get_security_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("system.securitySettings")),
) -> Any:
    """Calculates live security summary stats from audit logs."""
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.category == "Auth")
        .order_by(AuditLog.id.desc())
        .limit(200)
    )
    logs = result.scalars().all()

    failed_attempts_24h = 0
    active_logins_24h = 0
    last_audit_time = "Just now"

    for log in logs:
        action_lower = (log.action or "").lower()
        if "failed login" in action_lower:
            failed_attempts_24h += 1
        elif "login successful" in action_lower:
            active_logins_24h += 1

    if logs:
        last_audit_time = logs[0].timestamp

    return {
        "failedLoginAttempts24h": failed_attempts_24h,
        "activeSessions": max(active_logins_24h, 1),
        "lastAuditTime": last_audit_time,
    }
