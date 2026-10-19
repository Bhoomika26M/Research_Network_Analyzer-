"""Schemas for /api/v1/institutions and /api/v1/departments endpoints."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class InstitutionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    country: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=255)
    type: str | None = Field(default=None, max_length=100)
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class InstitutionUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=255)
    type: str | None = Field(default=None, max_length=100)
    is_active: bool | None = None


class InstitutionStatusIn(BaseModel):
    is_active: bool


class InstitutionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    country: str | None
    city: str | None
    website: str | None
    type: str | None = None
    is_active: bool = True
    created_at: datetime
    # Enrichment (batched in the list route, no N+1).
    short_name: str | None = None
    # Deliberately not named `departments`: a from_attributes read of that name
    # would lazy-load the ORM relationship (MissingGreenlet). Serialized as
    # "departments" on the wire.
    department_names: list[str] = Field(
        default_factory=list, serialization_alias="departments"
    )
    researchers_count: int = 0
    publications_count: int = 0
    active_projects_count: int = 0


class DepartmentCreate(BaseModel):
    institution_id: uuid.UUID
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    head_name: str | None = Field(default=None, max_length=255)
    budget: Decimal | None = Field(default=None, ge=0)

    @field_validator("name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class DepartmentUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    head_name: str | None = Field(default=None, max_length=255)
    budget: Decimal | None = Field(default=None, ge=0)


class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    institution_id: uuid.UUID
    name: str
    description: str | None
    head_name: str | None = None
    budget: Decimal | None = None
    created_at: datetime
