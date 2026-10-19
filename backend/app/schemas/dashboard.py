"""Dashboard, search and notification payloads."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.conference import ConferenceOut
from app.schemas.project import ProjectOut
from app.schemas.publication import PublicationOut


class YearCount(BaseModel):
    year: int
    count: int


class TypeCount(BaseModel):
    type: str
    count: int


class ResearcherDashboardOut(BaseModel):
    publications_count: int
    projects_count: int
    conferences_count: int
    collaborators_count: int
    citations_incoming: int
    publications_per_year: list[YearCount]
    publications_by_type: list[TypeCount]
    recent_publications: list[PublicationOut]
    recent_projects: list[ProjectOut]
    upcoming_conferences: list[ConferenceOut]


class InstitutionDashboardOut(BaseModel):
    institution_id: uuid.UUID | None
    departments_count: int
    researchers_count: int
    publications_count: int
    active_projects_count: int
    collaborations_count: int
    publications_per_year: list[YearCount]
    publications_by_type: list[TypeCount]


class InstitutionAnalyticsRow(BaseModel):
    institution_id: uuid.UUID
    name: str
    researchers: int
    publications: int
    projects: int


class RoleCount(BaseModel):
    role: str
    count: int


class AdminDashboardOut(BaseModel):
    users_count: int
    researchers_count: int
    institutions_count: int
    publications_count: int
    active_projects_count: int
    conferences_count: int
    citations_count: int
    users_by_role: list[RoleCount]
    publications_per_year: list[YearCount]
    publications_by_type: list[TypeCount]
    institutions: list[InstitutionAnalyticsRow]


class SearchHit(BaseModel):
    id: uuid.UUID
    kind: str
    title: str
    subtitle: str | None = None


class SearchOut(BaseModel):
    q: str
    researchers: list[SearchHit]
    publications: list[SearchHit]
    projects: list[SearchHit]
    institutions: list[SearchHit]


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    message: str
    is_read: bool
    created_at: datetime
    title: str | None = None
    read: bool | None = None
    type: str = "info"
