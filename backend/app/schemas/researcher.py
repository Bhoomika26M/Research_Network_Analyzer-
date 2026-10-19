"""Schemas for /api/v1/researchers endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.institution import DepartmentOut, InstitutionOut
from app.schemas.publication import PublicationBriefOut

ORCID_PATTERN = r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$"


class ResearcherCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    title: str | None = Field(default=None, max_length=100)
    bio: str | None = None
    orcid: str | None = Field(default=None, max_length=19, pattern=ORCID_PATTERN)
    department_id: uuid.UUID | None = None
    # Only a system_admin may link a profile to another user; otherwise it is
    # linked to the caller automatically.
    user_id: uuid.UUID | None = None

    @field_validator("first_name", "last_name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be empty")
        return value

    @field_validator("orcid", mode="before")
    @classmethod
    def _empty_orcid_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value.strip() if isinstance(value, str) else value


class ResearcherUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    title: str | None = Field(default=None, max_length=100)
    bio: str | None = None
    orcid: str | None = Field(default=None, max_length=19, pattern=ORCID_PATTERN)
    department_id: uuid.UUID | None = None


class ResearcherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    department_id: uuid.UUID | None
    first_name: str
    last_name: str
    full_name: str | None = None
    title: str | None
    orcid: str | None
    created_at: datetime
    # Enrichment (batched in the list route, no N+1).
    email: str | None = None
    is_active: bool | None = None
    institution_id: uuid.UUID | None = None
    institution_name: str | None = None
    department_name: str | None = None
    # Named to avoid the ORM `Researcher.skills`/`.interests` relationships;
    # serialized as "skills"/"interests" on the wire.
    skill_names: list[str] = Field(default_factory=list, serialization_alias="skills")
    interest_names: list[str] = Field(default_factory=list, serialization_alias="interests")
    publications_count: int = 0
    citations_count: int = 0


class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def _strip(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class SkillOut(BaseModel):
    name: str


class AffiliationIn(BaseModel):
    institution_id: uuid.UUID


class AffiliationOut(BaseModel):
    institution_id: uuid.UUID
    institution: InstitutionOut | None = None


class ResearcherProfileOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    department_id: uuid.UUID | None
    first_name: str
    last_name: str
    full_name: str
    title: str | None
    bio: str | None
    orcid: str | None
    created_at: datetime
    department: DepartmentOut | None = None
    skills: list[str] = []
    interests: list[str] = []
    affiliations: list[AffiliationOut] = []
    publications: list[PublicationBriefOut] = []
