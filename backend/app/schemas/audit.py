"""Schemas for /api/v1/audit-logs endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import AuditCategory


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    action: str
    entity_type: str
    entity_id: uuid.UUID | None
    category: AuditCategory
    details: dict | None
    ip_address: str | None
    timestamp: datetime
    # Enrichment (joined from users).
    user_name: str | None = None
    user_role: str | None = None


class AuditLogListResponse(BaseModel):
    items: list[AuditLogOut]
    total: int
    skip: int
    limit: int
