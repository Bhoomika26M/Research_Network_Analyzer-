"""Research projects: CRUD, members and 'my projects'."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.errors import ApiException
from app.models.enums import AuditCategory, ProjectStatus
from app.models.institution import Institution
from app.models.project import Project, ProjectMember
from app.models.researcher import Researcher
from app.schemas.common import Page
from app.schemas.institution import InstitutionOut
from app.schemas.project import (
    ProjectCreate,
    ProjectMemberIn,
    ProjectMemberOut,
    ProjectOut,
    ProjectUpdate,
)
from app.schemas.user import MessageResponse
from app.services.audit import client_ip, write_audit_log
from app.services.notifications import create_notification
from app.services.permissions import (
    can_create_project,
    can_edit_project,
    own_researcher_profile,
)

router = APIRouter(
    prefix="/api/v1/projects",
    tags=["projects"],
    dependencies=[Depends(get_current_user)],
)

_LOAD_OPTIONS = (
    selectinload(Project.institution),
    selectinload(Project.member_links).selectinload(ProjectMember.researcher),
)


async def _get_project_or_404(db: AsyncSession, project_id: uuid.UUID) -> Project:
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.deleted_at.is_(None))
        .options(*_LOAD_OPTIONS)
        .execution_options(populate_existing=True)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise ApiException(404, "project_not_found", "Project not found")
    return project


def _to_out(project: Project) -> ProjectOut:
    members = [
        ProjectMemberOut(
            researcher_id=link.researcher_id,
            full_name=link.researcher.full_name,
            role=link.role,
            start_date=link.start_date,
            end_date=link.end_date,
        )
        for link in project.member_links
        if link.researcher is not None and link.researcher.deleted_at is None
    ]
    return ProjectOut(
        id=project.id,
        title=project.title,
        description=project.description,
        funding_agency=project.funding_agency,
        budget=project.budget,
        start_date=project.start_date,
        end_date=project.end_date,
        status=project.status,
        institution_id=project.institution_id,
        institution=(
            InstitutionOut.model_validate(project.institution) if project.institution else None
        ),
        members=members,
        created_at=project.created_at,
        code=f"PRJ-{str(project.id)[:8].upper()}",
        lead_researcher_name=members[0].full_name if members else None,
        member_count=len(members),
    )


async def _require_edit(db, user, project: Project) -> None:
    if not await can_edit_project(db, user, project):
        raise ApiException(403, "forbidden", "You cannot edit this project")


async def _require_researcher(db: AsyncSession, researcher_id: uuid.UUID) -> Researcher:
    researcher = (
        await db.execute(
            select(Researcher).where(
                Researcher.id == researcher_id, Researcher.deleted_at.is_(None)
            )
        )
    ).scalar_one_or_none()
    if researcher is None:
        raise ApiException(404, "researcher_not_found", "Researcher not found")
    return researcher


@router.get("", response_model=Page[ProjectOut])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None, max_length=200),
    status: ProjectStatus | None = None,
    institution: uuid.UUID | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[ProjectOut]:
    stmt = select(Project).where(Project.deleted_at.is_(None))
    if q:
        stmt = stmt.where(Project.title.ilike(f"%{q}%"))
    if status is not None:
        stmt = stmt.where(Project.status == status)
    if institution is not None:
        stmt = stmt.where(Project.institution_id == institution)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.options(*_LOAD_OPTIONS)
            .execution_options(populate_existing=True)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    ).scalars().all()
    return Page[ProjectOut](
        items=[_to_out(item) for item in items], total=total, skip=skip, limit=limit
    )


@router.get("/mine", response_model=Page[ProjectOut])
async def list_my_projects(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[ProjectOut]:
    profile = await own_researcher_profile(db, user)
    if profile is None:
        return Page[ProjectOut](items=[], total=0, skip=skip, limit=limit)
    stmt = (
        select(Project)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(
            Project.deleted_at.is_(None),
            ProjectMember.researcher_id == profile.id,
        )
    )
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.options(*_LOAD_OPTIONS)
            .execution_options(populate_existing=True)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    ).scalars().unique().all()
    return Page[ProjectOut](
        items=[_to_out(item) for item in items], total=total, skip=skip, limit=limit
    )


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ProjectOut:
    return _to_out(await _get_project_or_404(db, project_id))


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    payload: ProjectCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ProjectOut:
    if not can_create_project(user):
        raise ApiException(403, "forbidden", "Your role cannot create projects")
    title = payload.title.strip()
    if not title:
        raise ApiException(400, "invalid_request", "title must not be empty")
    if payload.institution_id is not None:
        institution = await db.get(Institution, payload.institution_id)
        if institution is None or institution.deleted_at is not None:
            raise ApiException(404, "institution_not_found", "Institution not found")

    project = Project(
        title=title,
        description=payload.description,
        funding_agency=payload.funding_agency,
        budget=payload.budget,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
        institution_id=payload.institution_id,
    )
    db.add(project)
    await db.flush()

    members = list(payload.members)
    profile = await own_researcher_profile(db, user)
    if profile is not None and all(m.researcher_id != profile.id for m in members):
        members.insert(
            0,
            ProjectMemberIn(
                researcher_id=profile.id,
                role="Principal Investigator",
                start_date=payload.start_date,
            ),
        )
    seen: set[uuid.UUID] = set()
    for entry in members:
        if entry.researcher_id in seen:
            continue
        seen.add(entry.researcher_id)
        researcher = await _require_researcher(db, entry.researcher_id)
        db.add(
            ProjectMember(
                project_id=project.id,
                researcher_id=researcher.id,
                role=entry.role,
                start_date=entry.start_date,
                end_date=entry.end_date,
            )
        )
        if researcher.user_id and researcher.user_id != user.id:
            await create_notification(
                db,
                researcher.user_id,
                f'You were added to project "{project.title}"',
            )

    await write_audit_log(
        db,
        action="project_created",
        category=AuditCategory.PROJECT_LOG,
        user_id=user.id,
        entity_type="project",
        entity_id=project.id,
        details={"title": project.title},
        ip_address=client_ip(request),
    )
    return _to_out(await _get_project_or_404(db, project.id))


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ProjectOut:
    project = await _get_project_or_404(db, project_id)
    await _require_edit(db, user, project)
    changes = payload.model_dump(exclude_unset=True)
    if "title" in changes:
        title = (changes["title"] or "").strip()
        if not title:
            raise ApiException(400, "invalid_request", "title must not be empty")
        changes["title"] = title
    if changes.get("institution_id"):
        institution = await db.get(Institution, changes["institution_id"])
        if institution is None or institution.deleted_at is not None:
            raise ApiException(404, "institution_not_found", "Institution not found")
    if changes:
        for field, value in changes.items():
            setattr(project, field, value)
        await db.flush()
        await write_audit_log(
            db,
            action="project_updated",
            category=AuditCategory.PROJECT_LOG,
            user_id=user.id,
            entity_type="project",
            entity_id=project.id,
            details={"changed": sorted(changes)},
            ip_address=client_ip(request),
        )
    return _to_out(await _get_project_or_404(db, project.id))


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    project = await _get_project_or_404(db, project_id)
    await _require_edit(db, user, project)
    project.deleted_at = datetime.now(UTC)
    await db.flush()
    await write_audit_log(
        db,
        action="project_deleted",
        category=AuditCategory.PROJECT_LOG,
        user_id=user.id,
        entity_type="project",
        entity_id=project.id,
        details={"title": project.title},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Project deleted")


@router.get("/{project_id}/members", response_model=list[ProjectMemberOut])
async def list_members(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[ProjectMemberOut]:
    return _to_out(await _get_project_or_404(db, project_id)).members


@router.post("/{project_id}/members", response_model=ProjectOut, status_code=201)
async def add_member(
    project_id: uuid.UUID,
    payload: ProjectMemberIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ProjectOut:
    project = await _get_project_or_404(db, project_id)
    await _require_edit(db, user, project)
    researcher = await _require_researcher(db, payload.researcher_id)
    exists = (
        await db.execute(
            select(ProjectMember.project_id).where(
                ProjectMember.project_id == project.id,
                ProjectMember.researcher_id == researcher.id,
            )
        )
    ).scalar_one_or_none()
    if exists is not None:
        raise ApiException(409, "member_exists", "This researcher is already on the project")
    db.add(
        ProjectMember(
            project_id=project.id,
            researcher_id=researcher.id,
            role=payload.role,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
    )
    await db.flush()
    await create_notification(
        db,
        researcher.user_id,
        f'You were added to project "{project.title}"',
    )
    await write_audit_log(
        db,
        action="project_member_added",
        category=AuditCategory.PROJECT_LOG,
        user_id=user.id,
        entity_type="project",
        entity_id=project.id,
        details={"researcher_id": str(researcher.id)},
        ip_address=client_ip(request),
    )
    return _to_out(await _get_project_or_404(db, project.id))


@router.delete("/{project_id}/members/{researcher_id}", response_model=MessageResponse)
async def remove_member(
    project_id: uuid.UUID,
    researcher_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    project = await _get_project_or_404(db, project_id)
    await _require_edit(db, user, project)
    link = (
        await db.execute(
            select(ProjectMember).where(
                ProjectMember.project_id == project.id,
                ProjectMember.researcher_id == researcher_id,
            )
        )
    ).scalar_one_or_none()
    if link is None:
        raise ApiException(404, "member_not_found", "Project member not found")
    await db.delete(link)
    await db.flush()
    await write_audit_log(
        db,
        action="project_member_removed",
        category=AuditCategory.PROJECT_LOG,
        user_id=user.id,
        entity_type="project",
        entity_id=project.id,
        details={"researcher_id": str(researcher_id)},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Member removed")
