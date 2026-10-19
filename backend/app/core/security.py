"""Password hashing (bcrypt) and JWT access/refresh token creation/verification."""

import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt (salted automatically)."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Constant-time-ish check of a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    except ValueError:
        # bcrypt rejects >72-byte passwords and malformed hashes.
        return False


def _create_token(*, user_id: str, role: str, token_type: str, expires_delta: timedelta) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(*, user_id: str, role: str) -> str:
    """Short-lived token (default 30 minutes) used as the Bearer credential."""
    return _create_token(
        user_id=user_id,
        role=role,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(*, user_id: str, role: str) -> str:
    """Long-lived token (default 7 days) only accepted by POST /api/v1/auth/refresh."""
    return _create_token(
        user_id=user_id,
        role=role,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str, *, expected_type: str) -> dict:
    """Decode and validate a JWT.

    Raises ``jose.exceptions.JWTError`` on a bad signature, an expired token,
    or a token of the wrong type (access vs refresh).
    """
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != expected_type:
        raise JWTError(f"Expected a {expected_type} token")
    if not payload.get("sub"):
        raise JWTError("Token is missing a subject (sub) claim")
    return payload
