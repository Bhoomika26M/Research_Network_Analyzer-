"""Schemas for /api/v1/users endpoints."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import UserRole


def normalize_role(value: Any) -> Any:
    """Accept the role slug in any casing/spacing the UI may send.

    ``"System Admin"``, ``"system-admin"`` and ``"SYSTEM_ADMIN"`` all become
    ``UserRole.SYSTEM_ADMIN`` so a Title Case label can never produce a bogus
    422 or role_mismatch.
    """
    if isinstance(value, UserRole):
        return value
    if not isinstance(value, str):
        return value
    slug = value.strip().lower().replace("-", "_").replace(" ", "_")
    try:
        return UserRole(slug)
    except ValueError:
        return value  # unchanged -> pydantic reports the normal enum error


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class UserListResponse(BaseModel):
    items: list[UserOut]
    total: int
    skip: int
    limit: int


class RoleUpdateRequest(BaseModel):
    role: UserRole

    @field_validator("role", mode="before")
    @classmethod
    def _normalize_role(cls, value: Any) -> Any:
        return normalize_role(value)


class UserUpdateRequest(BaseModel):
    """Editable profile fields of an account (role has its own endpoint)."""

    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = Field(default=None, min_length=3, max_length=255)

    @field_validator("full_name")
    @classmethod
    def _strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("full_name must not be empty")
        return value

    @field_validator("email")
    @classmethod
    def _normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip().lower()
        local, _, domain = value.partition("@")
        if not local or not domain or "." not in domain:
            raise ValueError("Invalid email address")
        return value


class MessageResponse(BaseModel):
    message: str
