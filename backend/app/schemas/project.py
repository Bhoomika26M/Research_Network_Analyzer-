"""Schemas for projects, members and institutional collaborations."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ProjectStatus
from app.schemas.institution import InstitutionOut


class ProjectMemberIn(BaseModel):
    researcher_id: uuid.UUID
    role: str | None = Field(default=None, max_length=100)
    start_date: date
    end_date: date | None = None


class ProjectMemberOut(BaseModel):
    researcher_id: uuid.UUID
    full_name: str
    role: str | None
    start_date: date
    end_date: date | None


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str | None = None
    funding_agency: str | None = Field(default=None, max_length=255)
    budget: Decimal | None = None
    start_date: date
    end_date: date | None = None
    status: ProjectStatus = ProjectStatus.PLANNED
    institution_id: uuid.UUID | None = None
    members: list[ProjectMemberIn] = []


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    description: str | None = None
    funding_agency: str | None = Field(default=None, max_length=255)
    budget: Decimal | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: ProjectStatus | None = None
    institution_id: uuid.UUID | None = None


class ProjectOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    funding_agency: str | None
    budget: Decimal | None
    start_date: date
    end_date: date | None
    status: ProjectStatus
    institution_id: uuid.UUID | None
    institution: InstitutionOut | None = None
    members: list[ProjectMemberOut] = []
    created_at: datetime
    # Enrichment.
    code: str | None = None
    lead_researcher_name: str | None = None
    member_count: int = 0


class InstitutionalCollaborationCreate(BaseModel):
    institution_a_id: uuid.UUID
    institution_b_id: uuid.UUID
    type: str = Field(default="joint_research", max_length=100)
    status: str = Field(default="active", max_length=50)
    start_date: date
    end_date: date | None = None
    description: str | None = None


class InstitutionalCollaborationUpdate(BaseModel):
    type: str | None = Field(default=None, max_length=100)
    status: str | None = Field(default=None, max_length=50)
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None


class InstitutionalCollaborationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    institution_a_id: uuid.UUID
    institution_b_id: uuid.UUID
    type: str
    status: str
    start_date: date
    end_date: date | None
    description: str | None
    institution_a: InstitutionOut | None = None
    institution_b: InstitutionOut | None = None
    created_at: datetime


class CoAuthorCollabOut(BaseModel):
    researcher_id: uuid.UUID
    full_name: str
    shared_publications: int


class MyCollaborationProfileOut(BaseModel):
    """The signed-in user's own researcher profile (co-author + assignment tabs)."""

    researcher_id: uuid.UUID | None = None
    full_name: str | None = None


class NetworkNodeOut(BaseModel):
    id: uuid.UUID
    name: str
    institution: str | None = None
    publication_count: int


class NetworkEdgeOut(BaseModel):
    source: uuid.UUID
    target: uuid.UUID
    weight: int
    publications: list[str] = []


class NetworkGraphOut(BaseModel):
    nodes: list[NetworkNodeOut]
    edges: list[NetworkEdgeOut]
    links: list[NetworkEdgeOut] = []
