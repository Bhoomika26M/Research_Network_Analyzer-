"""Schemas for /api/v1/reviews and publication reviewer assignment."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import ReviewStatus


class ReviewAssignIn(BaseModel):
    reviewer_id: uuid.UUID


class ReviewUpdateIn(BaseModel):
    status: ReviewStatus
    comments: str | None = Field(default=None, max_length=10_000)


class ReviewOut(BaseModel):
    id: uuid.UUID
    publication_id: uuid.UUID
    publication_title: str
    reviewer_id: uuid.UUID
    reviewer_name: str
    status: ReviewStatus
    comments: str | None
    created_at: datetime
    updated_at: datetime
