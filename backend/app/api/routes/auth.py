"""Authentication endpoints: register, login, refresh, me, change-password."""

import urllib.parse

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_optional_user, load_user_from_token
from app.core.errors import ApiException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.enums import AuditCategory, UserRole
from app.models.user import User
from app.schemas import (
    ChangePasswordRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)
from app.services.audit import client_ip, write_audit_log

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _issue_tokens(user: User) -> TokenResponse:
    user_id, role = str(user.id), str(user.role)
    return TokenResponse(
        access_token=create_access_token(user_id=user_id, role=role),
        refresh_token=create_refresh_token(user_id=user_id, role=role),
    )


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> User:
    """Create an account.

    The public may register ``researcher``, ``institution_admin`` or
    ``reviewer``. A ``system_admin`` role is only accepted from an
    authenticated system_admin. Researchers become active immediately;
    institution_admin and reviewer accounts wait for approval.
    """
    role = payload.role or UserRole.RESEARCHER
    if role is UserRole.SYSTEM_ADMIN and (
        current_user is None or current_user.role is not UserRole.SYSTEM_ADMIN
    ):
        raise ApiException(
            403,
            "forbidden",
            "Only a system_admin can create system_admin accounts",
        )

    existing = (
        await db.execute(select(User.id).where(User.email == payload.email))
    ).scalar_one_or_none()
    if existing is not None:
        raise ApiException(409, "email_taken", "An account with this email already exists")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=role,
        is_active=role is UserRole.RESEARCHER,
    )
    db.add(user)
    await db.flush()
    await write_audit_log(
        db,
        action="register",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_id=user.id,
        details={"email": user.email, "role": str(role)},
        ip_address=client_ip(request),
    )
    return user


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """OAuth2 password grant: form-encoded ``username`` (= email) + ``password``.

    An optional ``role`` field carries the role card the user picked on the
    public page (``/admin-login`` sends ``system_admin``); when it does not
    match the account's real role the attempt is refused. Returns an access
    token (30 min) and a refresh token (7 days).
    """
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        raise ApiException(
            415,
            "unsupported_media_type",
            "Send application/x-www-form-urlencoded with username and password",
        )
    form = dict(
        urllib.parse.parse_qsl(
            (await request.body()).decode("utf-8", errors="replace"),
            keep_blank_values=True,
        )
    )
    email = (form.get("username") or "").strip().lower()
    password = form.get("password") or ""
    if not email or not password:
        raise ApiException(400, "invalid_request", "username and password are required")

    user = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()

    if user is None or user.deleted_at is not None or not verify_password(
        password, user.hashed_password
    ):
        await write_audit_log(
            db,
            action="login_failed",
            category=AuditCategory.SECURITY,
            user_id=user.id if user is not None and user.deleted_at is None else None,
            entity_id=user.id if user is not None else None,
            details={"email": email},
            ip_address=client_ip(request),
        )
        raise ApiException(401, "invalid_credentials", "Incorrect email or password")

    # Backend-only role check: the public page offers researcher,
    # institution_admin and reviewer; /admin-login offers system_admin only.
    requested_role = (form.get("role") or "").strip().lower()
    if requested_role:
        try:
            expected_role: UserRole | None = UserRole(requested_role)
        except ValueError:
            expected_role = None
        if expected_role is None or user.role is not expected_role:
            raise ApiException(
                403, "role_mismatch", f"This account is not a {requested_role}"
            )

    if not user.is_active:
        await write_audit_log(
            db,
            action="login_failed",
            category=AuditCategory.SECURITY,
            user_id=user.id,
            entity_id=user.id,
            details={"email": email, "reason": "deactivated"},
            ip_address=client_ip(request),
        )
        raise ApiException(
            403,
            "inactive_account",
            "Account pending approval by a system administrator",
        )

    await write_audit_log(
        db,
        action="login",
        category=AuditCategory.SECURITY,
        user_id=user.id,
        entity_id=user.id,
        details={"email": user.email},
        ip_address=client_ip(request),
    )
    return _issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Exchange a valid refresh token for a fresh access + refresh pair."""
    user = await load_user_from_token(db, payload.refresh_token, expected_type="refresh")
    return _issue_tokens(user)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> User:
    """The authenticated user's profile."""
    return user


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MessageResponse:
    """Change the password of the authenticated user."""
    if not verify_password(payload.old_password, user.hashed_password):
        raise ApiException(
            400, "invalid_credentials", "Current password is incorrect"
        )
    user.hashed_password = hash_password(payload.new_password)
    await db.flush()
    await write_audit_log(
        db,
        action="password_change",
        category=AuditCategory.SECURITY,
        user_id=user.id,
        entity_id=user.id,
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Password updated")
