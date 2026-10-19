"""Schemas for /api/v1/publications endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import PublicationStatus, PublicationType


class CoAuthorIn(BaseModel):
    researcher_id: uuid.UUID
    author_order: int | None = Field(default=None, ge=1)
    is_corresponding: bool = False


class CoAuthorOut(BaseModel):
    researcher_id: uuid.UUID
    author_order: int
    is_corresponding: bool
    full_name: str
    institution_name: str | None = None


class PublicationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    type: PublicationType
    year: int = Field(ge=1, le=9999)
    abstract: str | None = None
    venue: str | None = Field(default=None, max_length=255)
    doi: str | None = Field(default=None, max_length=255)
    co_authors: list[CoAuthorIn] = []


class PublicationUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    type: PublicationType | None = None
    year: int | None = Field(default=None, ge=1, le=9999)
    abstract: str | None = None
    venue: str | None = Field(default=None, max_length=255)
    doi: str | None = Field(default=None, max_length=255)
    # None = leave co-authors untouched; [] = remove them all.
    co_authors: list[CoAuthorIn] | None = None


class StatusUpdateIn(BaseModel):
    status: PublicationStatus


class PublicationOut(BaseModel):
    id: uuid.UUID
    title: str
    abstract: str | None
    type: PublicationType
    status: PublicationStatus
    year: int
    venue: str | None
    doi: str | None
    uploaded_by: uuid.UUID | None
    has_file: bool
    created_at: datetime
    co_authors: list[CoAuthorOut] = []
    # Enrichment.
    citations_count: int = 0
    keywords: list[str] = []


class PublicationBriefOut(BaseModel):
    """Compact publication entry as shown on a researcher profile."""

    id: uuid.UUID
    title: str
    year: int
    type: PublicationType
    status: PublicationStatus
    doi: str | None
    author_order: int
    is_corresponding: bool
