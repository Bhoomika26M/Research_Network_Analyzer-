from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models import (
    User, UserSession, NotificationSettings, SystemSettings,
    AppearanceSettings, PrivacySettings, AuditLog
)
from app.schemas import (
    ProfileRead, ProfileUpdate,
    NotificationSettingsRead, NotificationSettingsUpdate,
    SecurityOverviewRead, SessionRead, TwoFaUpdate, PasswordChangeRequest,
    SystemSettingsRead, SystemSettingsUpdate,
    AppearanceSettingsRead, AppearanceSettingsUpdate,
    PrivacySettingsRead, PrivacySettingsUpdate
)
from app.auth import get_current_user, require_admin, verify_password, get_password_hash

router = APIRouter(prefix="/api/settings", tags=["Settings"])

# ==================== Profile ====================
@router.get("/profile", response_model=ProfileRead)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user profile."""
    return current_user

@router.put("/profile", response_model=ProfileRead)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile fields."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
        # Update initials
        names = data.full_name.strip().split()
        initials = "".join([n[0].upper() for n in names if n])[:2]
        if initials:
            current_user.avatar_initials = initials
    if data.email is not None:
        current_user.email = str(data.email)
    if data.title is not None:
        current_user.title = data.title
    if data.department is not None:
        current_user.department = data.department
    if data.institution is not None:
        current_user.institution = data.institution
    if data.phone is not None:
        current_user.phone = data.phone
    if data.biography is not None:
        current_user.biography = data.biography

    current_user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(current_user)
    return current_user

# ==================== Notifications ====================
@router.get("/notifications", response_model=NotificationSettingsRead)
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notification preferences for the current user."""
    res = await db.execute(select(NotificationSettings).where(NotificationSettings.user_id == current_user.id))
    notifs = res.scalar_one_or_none()
    if not notifs:
        notifs = NotificationSettings(user_id=current_user.id)
        db.add(notifs)
        await db.commit()
        await db.refresh(notifs)
    return notifs

@router.put("/notifications", response_model=NotificationSettingsRead)
async def update_notifications(
    data: NotificationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update notification preferences."""
    res = await db.execute(select(NotificationSettings).where(NotificationSettings.user_id == current_user.id))
    notifs = res.scalar_one_or_none()
    if not notifs:
        notifs = NotificationSettings(user_id=current_user.id)
        db.add(notifs)

    notifs.email_notifs = data.email_notifs
    notifs.in_app_notifs = data.in_app_notifs
    notifs.pub_alerts = data.pub_alerts
    notifs.proj_alerts = data.proj_alerts
    notifs.conf_reminders = data.conf_reminders
    notifs.citation_alerts = data.citation_alerts

    await db.commit()
    await db.refresh(notifs)
    return notifs

# ==================== Security ====================
@router.get("/security", response_model=SecurityOverviewRead)
async def get_security_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get 2FA status and list of active sessions."""
    res = await db.execute(select(UserSession).where(UserSession.user_id == current_user.id).order_by(UserSession.id.asc()))
    sessions = res.scalars().all()
    session_list = [
        SessionRead(
            id=s.id,
            device=s.device,
            location=s.location,
            time=s.time,
            current=s.is_current
        ) for s in sessions
    ]
    return SecurityOverviewRead(
        two_fa_enabled=current_user.two_fa_enabled,
        sessions=session_list
    )

@router.put("/security/2fa", response_model=dict)
async def toggle_two_fa(
    data: TwoFaUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Enable or disable Two-Factor Authentication."""
    current_user.two_fa_enabled = data.enabled
    await db.commit()
    return {"two_fa_enabled": current_user.two_fa_enabled, "message": "2FA updated successfully"}

@router.post("/security/password", response_model=dict)
async def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user password after validating current password."""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match."
        )
    current_user.hashed_password = get_password_hash(data.new_password)
    current_user.updated_at = datetime.utcnow()

    # Log into audit logs
    audit = AuditLog(
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        user=current_user.full_name or current_user.email,
        action="Password Changed",
        target="Account Security Credentials",
        ip="127.0.0.1",
        result="Success",
        tab_category="Security Logs"
    )
    db.add(audit)
    await db.commit()
    return {"message": "Password updated successfully"}

@router.delete("/security/sessions/{session_id}", response_model=dict)
async def revoke_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke an active session by session ID."""
    res = await db.execute(
        select(UserSession).where(
            UserSession.id == session_id,
            UserSession.user_id == current_user.id
        )
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.is_current:
        raise HTTPException(status_code=400, detail="Cannot revoke your current active session.")

    await db.delete(session)
    await db.commit()
    return {"message": f"Session {session_id} revoked successfully"}

# ==================== System (Admin Only) ====================
@router.get("/system", response_model=SystemSettingsRead)
async def get_system_settings(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get system-wide settings (admin only)."""
    res = await db.execute(select(SystemSettings).order_by(SystemSettings.id.asc()))
    system_cfg = res.scalars().first()
    if not system_cfg:
        system_cfg = SystemSettings()
        db.add(system_cfg)
        await db.commit()
        await db.refresh(system_cfg)
    return system_cfg

@router.put("/system", response_model=SystemSettingsRead)
async def update_system_settings(
    data: SystemSettingsUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Save system-wide configuration (admin only)."""
    res = await db.execute(select(SystemSettings).order_by(SystemSettings.id.asc()))
    system_cfg = res.scalars().first()
    if not system_cfg:
        system_cfg = SystemSettings()
        db.add(system_cfg)

    system_cfg.default_user_role = data.default_user_role
    system_cfg.session_timeout = data.session_timeout
    system_cfg.data_retention = data.data_retention
    system_cfg.feature_flags = data.feature_flags
    system_cfg.updated_at = datetime.utcnow()

    # Log into audit logs
    audit = AuditLog(
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        user=admin.full_name or admin.email,
        action="System Configuration Updated",
        target=f"Role: {data.default_user_role}, Retention: {data.data_retention}d",
        ip="127.0.0.1",
        result="Success",
        tab_category="User Activity"
    )
    db.add(audit)
    await db.commit()
    await db.refresh(system_cfg)
    return system_cfg

# ==================== Appearance ====================
@router.get("/appearance", response_model=AppearanceSettingsRead)
async def get_appearance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get appearance settings for user."""
    res = await db.execute(select(AppearanceSettings).where(AppearanceSettings.user_id == current_user.id))
    app_cfg = res.scalar_one_or_none()
    if not app_cfg:
        app_cfg = AppearanceSettings(user_id=current_user.id)
        db.add(app_cfg)
        await db.commit()
        await db.refresh(app_cfg)
    return app_cfg

@router.put("/appearance", response_model=AppearanceSettingsRead)
async def update_appearance(
    data: AppearanceSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update accent color, density, and dark mode."""
    res = await db.execute(select(AppearanceSettings).where(AppearanceSettings.user_id == current_user.id))
    app_cfg = res.scalar_one_or_none()
    if not app_cfg:
        app_cfg = AppearanceSettings(user_id=current_user.id)
        db.add(app_cfg)

    app_cfg.selected_accent = data.selected_accent
    app_cfg.density = data.density
    if data.dark_mode is not None:
        app_cfg.dark_mode = data.dark_mode

    await db.commit()
    await db.refresh(app_cfg)
    return app_cfg

# ==================== Data & Privacy ====================
@router.get("/privacy", response_model=PrivacySettingsRead)
async def get_privacy(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get data & privacy settings."""
    res = await db.execute(select(PrivacySettings).where(PrivacySettings.user_id == current_user.id))
    priv = res.scalar_one_or_none()
    if not priv:
        priv = PrivacySettings(user_id=current_user.id)
        db.add(priv)
        await db.commit()
        await db.refresh(priv)
    return priv

@router.put("/privacy", response_model=PrivacySettingsRead)
async def update_privacy(
    data: PrivacySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update privacy toggle states."""
    res = await db.execute(select(PrivacySettings).where(PrivacySettings.user_id == current_user.id))
    priv = res.scalar_one_or_none()
    if not priv:
        priv = PrivacySettings(user_id=current_user.id)
        db.add(priv)

    priv.privacy_toggles = data.privacy_toggles
    await db.commit()
    await db.refresh(priv)
    return priv

@router.post("/privacy/export-data", response_model=dict)
async def request_data_export(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Request complete user data export archive."""
    res = await db.execute(select(PrivacySettings).where(PrivacySettings.user_id == current_user.id))
    priv = res.scalar_one_or_none()
    if not priv:
        priv = PrivacySettings(user_id=current_user.id)
        db.add(priv)

    priv.export_requested = True
    priv.export_requested_at = datetime.utcnow()

    # Log into audit logs
    audit = AuditLog(
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        user=current_user.full_name or current_user.email,
        action="Data Export Requested",
        target="Full Account Archive",
        ip="127.0.0.1",
        result="Success",
        tab_category="User Activity"
    )
    db.add(audit)
    await db.commit()
    return {
        "message": "Data export request submitted. An archive download link will be prepared.",
        "export_requested": True
    }

@router.delete("/privacy/account", response_model=dict)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Permanently delete account and all associated settings."""
    user_id = current_user.id
    email = current_user.email

    audit = AuditLog(
        timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        user=email,
        action="Account Deletion",
        target=f"User ID {user_id}",
        ip="127.0.0.1",
        result="Success",
        tab_category="Security Logs"
    )
    db.add(audit)
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account deleted successfully"}
