"""Institutions: list/get for any user; create/delete system_admin; update by admin."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_roles
from app.core.errors import ApiException
from app.models.enums import AuditCategory, ProjectStatus
from app.models.institution import Department, Institution
from app.models.project import Project
from app.models.publication import Publication, PublicationAuthor
from app.models.researcher import Researcher
from app.schemas import (
    InstitutionCreate,
    InstitutionOut,
    InstitutionStatusIn,
    InstitutionUpdate,
    MessageResponse,
    Page,
)
from app.services.audit import client_ip, write_audit_log
from app.services.permissions import managed_institution_ids

router = APIRouter(
    prefix="/api/v1/institutions",
    tags=["institutions"],
    dependencies=[Depends(get_current_user)],
)


async def _get_institution_or_404(db: AsyncSession, institution_id: uuid.UUID) -> Institution:
    institution = await db.get(Institution, institution_id)
    if institution is None or institution.deleted_at is not None:
        raise ApiException(404, "institution_not_found", "Institution not found")
    return institution


async def _refetch_institution(db: AsyncSession, institution_id: uuid.UUID) -> Institution:
    """Re-select an institution with ``populate_existing`` so the response is
    built from fresh, non-expired column values (no lazy load in async)."""
    result = await db.execute(
        select(Institution)
        .where(Institution.id == institution_id)
        .execution_options(populate_existing=True)
    )
    return result.scalar_one()


def _acronym(name: str) -> str:
    words = [word for word in name.replace("-", " ").split() if word]
    if len(words) <= 1:
        return name[:32]
    return "".join(word[0] for word in words).upper()[:8]


async def _enrich_institutions(
    db: AsyncSession, items: list[Institution]
) -> list[InstitutionOut]:
    """Attach departments + counts to a page of institutions in a fixed number
    of batched aggregation queries (no N+1)."""
    ids = [institution.id for institution in items]
    # Build from scalar columns only: ``InstitutionOut.departments`` shadows the
    # ORM relationship of the same name, so ``model_validate`` would trigger a
    # lazy load (MissingGreenlet) in async context.
    out: dict[uuid.UUID, InstitutionOut] = {
        institution.id: InstitutionOut(
            id=institution.id,
            name=institution.name,
            country=institution.country,
            city=institution.city,
            website=institution.website,
            type=institution.type,
            is_active=institution.is_active,
            created_at=institution.created_at,
        )
        for institution in items
    }
    if not ids:
        return []

    for row in out.values():
        row.short_name = _acronym(row.name)

    dept_rows = await db.execute(
        select(Department.institution_id, Department.name).where(
            Department.institution_id.in_(ids), Department.deleted_at.is_(None)
        )
    )
    dept_buckets: dict[uuid.UUID, list[str]] = {}
    for institution_id, name in dept_rows:
        dept_buckets.setdefault(institution_id, []).append(name)
    for institution_id, names in dept_buckets.items():
        out[institution_id].department_names = sorted(names)

    researcher_rows = await db.execute(
        select(Department.institution_id, func.count(Researcher.id))
        .join(Researcher, Researcher.department_id == Department.id)
        .where(
            Department.institution_id.in_(ids),
            Department.deleted_at.is_(None),
            Researcher.deleted_at.is_(None),
        )
        .group_by(Department.institution_id)
    )
    for institution_id, count in researcher_rows:
        out[institution_id].researchers_count = int(count)

    publication_rows = await db.execute(
        select(
            Department.institution_id,
            func.count(func.distinct(PublicationAuthor.publication_id)),
        )
        .select_from(PublicationAuthor)
        .join(Researcher, Researcher.id == PublicationAuthor.researcher_id)
        .join(Department, Department.id == Researcher.department_id)
        .join(Publication, Publication.id == PublicationAuthor.publication_id)
        .where(
            Department.institution_id.in_(ids),
            Department.deleted_at.is_(None),
            Researcher.deleted_at.is_(None),
            Publication.deleted_at.is_(None),
        )
        .group_by(Department.institution_id)
    )
    for institution_id, count in publication_rows:
        out[institution_id].publications_count = int(count)

    project_rows = await db.execute(
        select(Project.institution_id, func.count())
        .where(
            Project.institution_id.in_(ids),
            Project.deleted_at.is_(None),
            Project.status == ProjectStatus.ACTIVE,
        )
        .group_by(Project.institution_id)
    )
    for institution_id, count in project_rows:
        out[institution_id].active_projects_count = int(count)

    return list(out.values())


async def _require_can_update(db: AsyncSession, user, institution: Institution) -> None:
    managed = await managed_institution_ids(db, user)
    if managed is not None and institution.id not in managed:
        raise ApiException(
            403,
            "forbidden",
            "Only a system_admin or the institution_admin of this institution can update it",
        )


@router.get("", response_model=Page[InstitutionOut])
async def list_institutions(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None, max_length=100, description="Search name/country/city"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[InstitutionOut]:
    """Paginated institutions with text search."""
    stmt = select(Institution).where(Institution.deleted_at.is_(None))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Institution.name.ilike(pattern),
                Institution.country.ilike(pattern),
                Institution.city.ilike(pattern),
            )
        )
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(stmt.order_by(Institution.created_at.desc()).offset(skip).limit(limit))
    ).scalars().all()
    return Page[InstitutionOut](
        items=await _enrich_institutions(db, items), total=total, skip=skip, limit=limit
    )


@router.get("/{institution_id}", response_model=InstitutionOut)
async def get_institution(
    institution_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> InstitutionOut:
    """Fetch a single institution by id (with counts)."""
    institution = await _get_institution_or_404(db, institution_id)
    return (await _enrich_institutions(db, [institution]))[0]


@router.post(
    "",
    response_model=InstitutionOut,
    status_code=201,
    dependencies=[Depends(require_roles("system_admin"))],
)
async def create_institution(
    payload: InstitutionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_roles("system_admin")),
) -> Institution:
    """Create an institution (system_admin only, audited)."""
    existing = (
        await db.execute(
            select(Institution.id).where(func.lower(Institution.name) == payload.name.lower())
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise ApiException(409, "name_taken", "An institution with this name already exists")

    institution = Institution(
        name=payload.name,
        country=payload.country,
        city=payload.city,
        website=payload.website,
        type=payload.type,
        is_active=payload.is_active,
    )
    db.add(institution)
    await db.flush()
    await write_audit_log(
        db,
        action="institution_created",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="institution",
        entity_id=institution.id,
        details={"name": institution.name},
        ip_address=client_ip(request),
    )
    return await _refetch_institution(db, institution.id)


@router.patch("/{institution_id}", response_model=InstitutionOut)
async def update_institution(
    institution_id: uuid.UUID,
    payload: InstitutionUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> Institution:
    """Update an institution: system_admin, or the institution_admin managing it (audited)."""
    institution = await _get_institution_or_404(db, institution_id)
    await _require_can_update(db, user, institution)

    changes = payload.model_dump(exclude_unset=True)
    if "name" in changes and changes["name"] is not None:
        changes["name"] = changes["name"].strip()
        if not changes["name"]:
            raise ApiException(400, "invalid_request", "name must not be empty")
        clash = (
            await db.execute(
                select(Institution.id).where(
                    func.lower(Institution.name) == changes["name"].lower(),
                    Institution.id != institution.id,
                )
            )
        ).scalar_one_or_none()
        if clash is not None:
            raise ApiException(409, "name_taken", "An institution with this name already exists")

    for field, value in changes.items():
        setattr(institution, field, value)
    await db.flush()
    await write_audit_log(
        db,
        action="institution_updated",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="institution",
        entity_id=institution.id,
        details={"changed": sorted(changes)},
        ip_address=client_ip(request),
    )
    return await _refetch_institution(db, institution.id)


@router.patch(
    "/{institution_id}/status",
    response_model=InstitutionOut,
    dependencies=[Depends(require_roles("system_admin"))],
)
async def set_institution_status(
    institution_id: uuid.UUID,
    payload: InstitutionStatusIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_roles("system_admin")),
) -> Institution:
    """Activate / deactivate an institution (system_admin only, audited)."""
    institution = await _get_institution_or_404(db, institution_id)
    institution.is_active = payload.is_active
    await db.flush()
    await write_audit_log(
        db,
        action="institution_status_changed",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="institution",
        entity_id=institution.id,
        details={"name": institution.name, "is_active": payload.is_active},
        ip_address=client_ip(request),
    )
    return await _refetch_institution(db, institution.id)


@router.delete(
    "/{institution_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles("system_admin"))],
)
async def delete_institution(
    institution_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_roles("system_admin")),
) -> MessageResponse:
    """Soft-delete an institution (system_admin only, audited)."""
    institution = await _get_institution_or_404(db, institution_id)
    institution.deleted_at = datetime.now(UTC)
    await db.flush()
    await write_audit_log(
        db,
        action="institution_deleted",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="institution",
        entity_id=institution.id,
        details={"name": institution.name},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Institution deleted")
