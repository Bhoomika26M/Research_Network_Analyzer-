"""User management (system_admin only): list, get one, role, activate/deactivate."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_roles
from app.core.errors import ApiException
from app.models.enums import AuditCategory, UserRole
from app.models.user import User
from app.schemas import (
    MessageResponse,
    RoleUpdateRequest,
    UserListResponse,
    UserOut,
    UserUpdateRequest,
)
from app.services.audit import client_ip, write_audit_log

router = APIRouter(
    prefix="/api/v1/users",
    tags=["users"],
    dependencies=[Depends(require_roles("system_admin"))],
)


async def _get_user_or_404(db: AsyncSession, user_id: uuid.UUID) -> User:
    user = await db.get(User, user_id)
    if user is None or user.deleted_at is not None:
        raise ApiException(404, "user_not_found", "User not found")
    return user


@router.get("", response_model=UserListResponse)
async def list_users(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None, max_length=100, description="Search email/full name"),
    role: UserRole | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> UserListResponse:
    """Paginated user list with optional text search and role filter."""
    stmt = select(User).where(User.deleted_at.is_(None))
    if role is not None:
        stmt = stmt.where(User.role == role)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(User.email.ilike(pattern), User.full_name.ilike(pattern)))

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(stmt.order_by(User.created_at.desc()).offset(skip).limit(limit))
    ).scalars().all()
    return UserListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Fetch a single user by id."""
    return await _get_user_or_404(db, user_id)


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles("system_admin")),
) -> User:
    """Edit an account's full name / email (audited).

    Role changes live on ``/{user_id}/role``; activations on
    ``/{user_id}/activate|deactivate``. Renaming yourself is allowed — only
    demoting, deactivating or deleting yourself is not.
    """
    target = await _get_user_or_404(db, user_id)
    changes: dict[str, str] = {}

    if payload.email is not None and payload.email != target.email:
        taken = (
            await db.execute(
                select(User.id).where(
                    User.email == payload.email, User.id != target.id
                )
            )
        ).scalar_one_or_none()
        if taken is not None:
            raise ApiException(
                409, "email_taken", "An account with this email already exists"
            )
        changes["email"] = target.email
        target.email = payload.email

    if payload.full_name is not None and payload.full_name != target.full_name:
        changes["full_name"] = target.full_name
        target.full_name = payload.full_name

    if not changes:
        return target

    await db.flush()
    await write_audit_log(
        db,
        action="user_updated",
        category=AuditCategory.SECURITY,
        user_id=admin.id,
        entity_id=target.id,
        details={"target_email": target.email, "previous": changes},
        ip_address=client_ip(request),
    )
    return target


@router.patch("/{user_id}/role", response_model=UserOut)
async def update_role(
    user_id: uuid.UUID,
    payload: RoleUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles("system_admin")),
) -> User:
    """Change a user's role (audited). Admins cannot demote themselves."""
    target = await _get_user_or_404(db, user_id)
    if target.id == admin.id and payload.role is not target.role:
        raise ApiException(400, "self_role_change", "You cannot change your own role")
    if payload.role is target.role:
        return target

    old_role = target.role
    target.role = payload.role
    await db.flush()
    await write_audit_log(
        db,
        action="role_change",
        category=AuditCategory.SECURITY,
        user_id=admin.id,
        entity_id=target.id,
        details={
            "target_email": target.email,
            "old_role": str(old_role),
            "new_role": str(payload.role),
        },
        ip_address=client_ip(request),
    )
    return target


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles("system_admin")),
) -> MessageResponse:
    """Soft-delete an account (audited). Admins cannot delete themselves."""
    target = await _get_user_or_404(db, user_id)
    if target.id == admin.id:
        raise ApiException(400, "self_delete", "You cannot delete your own account")
    target.deleted_at = datetime.now(UTC)
    target.is_active = False
    await db.flush()
    await write_audit_log(
        db,
        action="user_deleted",
        category=AuditCategory.SECURITY,
        user_id=admin.id,
        entity_id=target.id,
        details={"target_email": target.email, "target_role": str(target.role)},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="User deleted")


@router.post("/{user_id}/activate", response_model=UserOut)
async def activate_user(
    user_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles("system_admin")),
) -> User:
    """Re-activate a deactivated account (audited)."""
    target = await _get_user_or_404(db, user_id)
    return await _set_active(db, request, admin, target, active=True)


@router.post("/{user_id}/deactivate", response_model=UserOut)
async def deactivate_user(
    user_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles("system_admin")),
) -> User:
    """Deactivate an account (audited). Admins cannot deactivate themselves."""
    target = await _get_user_or_404(db, user_id)
    return await _set_active(db, request, admin, target, active=False)


async def _set_active(
    db: AsyncSession,
    request: Request,
    admin: User,
    target: User,
    *,
    active: bool,
) -> User:
    if target.id == admin.id and not active:
        raise ApiException(400, "self_deactivate", "You cannot deactivate your own account")
    if target.is_active is active:
        return target

    target.is_active = active
    await db.flush()
    await write_audit_log(
        db,
        action="user_activated" if active else "user_deactivated",
        category=AuditCategory.SECURITY,
        user_id=admin.id,
        entity_id=target.id,
        details={"target_email": target.email},
        ip_address=client_ip(request),
    )
    return target
