"""Departments: list/get for any user; create/delete system_admin; update by institution admin."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_roles
from app.core.errors import ApiException
from app.models.enums import AuditCategory
from app.models.institution import Department, Institution
from app.schemas import (
    DepartmentCreate,
    DepartmentOut,
    DepartmentUpdate,
    MessageResponse,
    Page,
)
from app.services.audit import client_ip, write_audit_log
from app.services.permissions import managed_institution_ids

router = APIRouter(
    prefix="/api/v1/departments",
    tags=["departments"],
    dependencies=[Depends(get_current_user)],
)


async def _get_department_or_404(db: AsyncSession, department_id: uuid.UUID) -> Department:
    department = await db.get(Department, department_id)
    if department is None or department.deleted_at is not None:
        raise ApiException(404, "department_not_found", "Department not found")
    return department


async def _refetch_department(db: AsyncSession, department_id: uuid.UUID) -> Department:
    """Re-select a department with ``populate_existing`` so the response is
    built from fresh column values (no lazy load in async)."""
    result = await db.execute(
        select(Department)
        .where(Department.id == department_id)
        .execution_options(populate_existing=True)
    )
    return result.scalar_one()


async def _require_can_update(db: AsyncSession, user, department: Department) -> None:
    managed = await managed_institution_ids(db, user)
    if managed is not None and department.institution_id not in managed:
        raise ApiException(
            403,
            "forbidden",
            "Only a system_admin or the institution_admin of this department's "
            "institution can update it",
        )


async def _require_institution(db: AsyncSession, institution_id: uuid.UUID) -> Institution:
    institution = await db.get(Institution, institution_id)
    if institution is None or institution.deleted_at is not None:
        raise ApiException(404, "institution_not_found", "Institution not found")
    return institution


@router.get("", response_model=Page[DepartmentOut])
async def list_departments(
    db: AsyncSession = Depends(get_db),
    institution_id: uuid.UUID | None = None,
    q: str | None = Query(default=None, max_length=100, description="Search name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[DepartmentOut]:
    """Paginated departments, optionally filtered by institution, with text search."""
    stmt = select(Department).where(Department.deleted_at.is_(None))
    if institution_id is not None:
        stmt = stmt.where(Department.institution_id == institution_id)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(Department.name.ilike(pattern), Department.description.ilike(pattern))
        )
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(stmt.order_by(Department.created_at.desc()).offset(skip).limit(limit))
    ).scalars().all()
    return Page[DepartmentOut](items=items, total=total, skip=skip, limit=limit)


@router.get("/{department_id}", response_model=DepartmentOut)
async def get_department(
    department_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Department:
    """Fetch a single department by id."""
    return await _get_department_or_404(db, department_id)


@router.post(
    "",
    response_model=DepartmentOut,
    status_code=201,
    dependencies=[Depends(require_roles("system_admin"))],
)
async def create_department(
    payload: DepartmentCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_roles("system_admin")),
) -> Department:
    """Create a department (system_admin only, audited)."""
    await _require_institution(db, payload.institution_id)
    existing = (
        await db.execute(
            select(Department.id).where(
                Department.institution_id == payload.institution_id,
                func.lower(Department.name) == payload.name.lower(),
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise ApiException(
            409, "name_taken", "A department with this name already exists in this institution"
        )

    department = Department(
        institution_id=payload.institution_id,
        name=payload.name,
        description=payload.description,
        head_name=payload.head_name,
        budget=payload.budget,
    )
    db.add(department)
    await db.flush()
    await write_audit_log(
        db,
        action="department_created",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="department",
        entity_id=department.id,
        details={"name": department.name, "institution_id": str(department.institution_id)},
        ip_address=client_ip(request),
    )
    return await _refetch_department(db, department.id)


@router.patch("/{department_id}", response_model=DepartmentOut)
async def update_department(
    department_id: uuid.UUID,
    payload: DepartmentUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> Department:
    """Update a department: system_admin, or the institution_admin of its institution (audited)."""
    department = await _get_department_or_404(db, department_id)
    await _require_can_update(db, user, department)

    changes = payload.model_dump(exclude_unset=True)
    if changes.get("name") is not None:
        changes["name"] = changes["name"].strip()
        if not changes["name"]:
            raise ApiException(400, "invalid_request", "name must not be empty")
        clash = (
            await db.execute(
                select(Department.id).where(
                    Department.institution_id == department.institution_id,
                    func.lower(Department.name) == changes["name"].lower(),
                    Department.id != department.id,
                )
            )
        ).scalar_one_or_none()
        if clash is not None:
            raise ApiException(
                409, "name_taken", "A department with this name already exists in this institution"
            )

    for field, value in changes.items():
        setattr(department, field, value)
    await db.flush()
    await write_audit_log(
        db,
        action="department_updated",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="department",
        entity_id=department.id,
        details={"changed": sorted(changes)},
        ip_address=client_ip(request),
    )
    return await _refetch_department(db, department.id)


@router.delete(
    "/{department_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles("system_admin"))],
)
async def delete_department(
    department_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_roles("system_admin")),
) -> MessageResponse:
    """Soft-delete a department (system_admin only, audited)."""
    department = await _get_department_or_404(db, department_id)
    department.deleted_at = datetime.now(UTC)
    await db.flush()
    await write_audit_log(
        db,
        action="department_deleted",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="department",
        entity_id=department.id,
        details={"name": department.name},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Department deleted")
