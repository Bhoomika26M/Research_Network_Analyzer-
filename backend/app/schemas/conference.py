"""Schemas for conferences, registrations and presentations."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ConferenceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    start_date: date
    end_date: date | None = None
    website: str | None = Field(default=None, max_length=255)
    submission_deadline: date | None = None
    topics: str | None = None


class ConferenceUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    website: str | None = Field(default=None, max_length=255)
    submission_deadline: date | None = None
    topics: str | None = None


class ConferenceRegisterIn(BaseModel):
    researcher_id: uuid.UUID | None = None
    publication_id: uuid.UUID | None = None
    presentation_type: str | None = Field(default=None, max_length=50)


class PresentationIn(BaseModel):
    researcher_id: uuid.UUID
    publication_id: uuid.UUID
    presentation_type: str = Field(min_length=1, max_length=50)


class ParticipationOut(BaseModel):
    researcher_id: uuid.UUID
    full_name: str
    publication_id: uuid.UUID | None
    publication_title: str | None = None
    presentation_type: str | None
    registration_status: str | None
    presentation_date: date | None = None


class ConferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    location: str | None
    start_date: date
    end_date: date | None
    website: str | None
    submission_deadline: date | None = None
    topics: str | None = None
    created_at: datetime
    registrations: list[ParticipationOut] = []
    # Enrichment.
    acronym: str | None = None
    registration_count: int = 0


class ConferenceScheduleItem(BaseModel):
    id: uuid.UUID
    name: str
    location: str | None
    start_date: date
    end_date: date | None
    website: str | None
