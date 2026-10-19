"""Shared FastAPI dependencies: DB session, current user, role guards."""

import uuid
from collections.abc import Callable

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiException
from app.core.security import decode_token
from app.db.session import get_db  # noqa: F401  (re-exported for convenience)
from app.models.enums import UserRole
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)


async def load_user_from_token(
    db: AsyncSession,
    token: str,
    *,
    expected_type: str = "access",
) -> User:
    """Decode *token*, look its subject up in the users table, checks it is live.

    Raises 401 for a bad/expired/wrong-type token or an unknown/deleted user,
    and 403 for a deactivated account.
    """
    try:
        payload = decode_token(token, expected_type=expected_type)
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, ValueError, KeyError, TypeError):
        raise ApiException(
            401, "invalid_token", "Could not validate credentials"
        ) from None

    result = await db.execute(
        select(User).where(User.id == user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise ApiException(401, "invalid_token", "Could not validate credentials")
    if not user.is_active:
        raise ApiException(403, "inactive_account", "This account has been deactivated")
    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Authenticated user behind the Bearer access token (401/403 otherwise)."""
    return await load_user_from_token(db, token)


async def get_optional_user(
    token: str | None = Depends(optional_oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Like get_current_user, but anonymous requests (or bad tokens) yield None."""
    if not token:
        return None
    try:
        return await load_user_from_token(db, token)
    except ApiException:
        return None


def require_roles(*roles: str | UserRole) -> Callable[..., User]:
    """Route dependency factory: the current user must hold one of *roles*.

    All four roles exist in UserRole; example::

        @router.get("/admin-only", dependencies=[Depends(require_roles("system_admin"))])
    """
    allowed = {str(role) for role in roles}

    def dependency(user: User = Depends(get_current_user)) -> User:
        if str(user.role) not in allowed:
            raise ApiException(403, "forbidden", "Insufficient role for this action")
        return user

    return dependency
