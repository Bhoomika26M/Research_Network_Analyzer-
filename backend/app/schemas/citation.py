"""Schemas for citation records and DOI helpers."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import PublicationStatus, PublicationType


class CitationCreate(BaseModel):
    citing_publication_id: uuid.UUID
    cited_publication_id: uuid.UUID


class CitationOut(BaseModel):
    citing_publication_id: uuid.UUID
    cited_publication_id: uuid.UUID
    citing_title: str
    cited_title: str
    created_at: datetime
    # Enrichment (from the citing publication).
    citing_venue: str | None = None
    citing_year: int | None = None
    citing_doi: str | None = None
    citing_authors: str | None = None


class CitationCountOut(BaseModel):
    publication_id: uuid.UUID
    incoming: int
    outgoing: int


class ReferenceListOut(BaseModel):
    publication_id: uuid.UUID
    items: list[CitationOut]


class ReferenceReplaceIn(BaseModel):
    cited_publication_ids: list[uuid.UUID]


class DoiValidateOut(BaseModel):
    doi: str
    valid: bool


class CitedPublicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    year: int
    type: PublicationType
    status: PublicationStatus
    doi: str | None
    venue: str | None
