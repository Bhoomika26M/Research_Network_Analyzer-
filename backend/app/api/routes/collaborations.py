"""Institutional collaborations and the co-authorship network."""

import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.api.deps import get_current_user, get_db, require_roles
from app.core.errors import ApiException
from app.models.collaboration import InstitutionalCollaboration
from app.models.enums import AuditCategory
from app.models.institution import Department, Institution
from app.models.publication import Publication, PublicationAuthor
from app.models.researcher import Researcher, ResearcherAffiliation
from app.schemas.common import Page
from app.schemas.institution import InstitutionOut
from app.schemas.project import (
    CoAuthorCollabOut,
    InstitutionalCollaborationCreate,
    InstitutionalCollaborationOut,
    InstitutionalCollaborationUpdate,
    MyCollaborationProfileOut,
    NetworkEdgeOut,
    NetworkGraphOut,
    NetworkNodeOut,
)
from app.schemas.user import MessageResponse
from app.services.audit import client_ip, write_audit_log
from app.services.permissions import own_researcher_profile

router = APIRouter(
    prefix="/api/v1",
    tags=["collaboration"],
    dependencies=[Depends(get_current_user)],
)

_COLLAB_LOAD = (
    selectinload(InstitutionalCollaboration.institution_a),
    selectinload(InstitutionalCollaboration.institution_b),
)


def _ordered_pair(a: uuid.UUID, b: uuid.UUID) -> tuple[uuid.UUID, uuid.UUID]:
    return (a, b) if str(a) < str(b) else (b, a)


async def _get_collab_or_404(
    db: AsyncSession, collab_id: uuid.UUID
) -> InstitutionalCollaboration:
    result = await db.execute(
        select(InstitutionalCollaboration)
        .where(
            InstitutionalCollaboration.id == collab_id,
            InstitutionalCollaboration.deleted_at.is_(None),
        )
        .options(*_COLLAB_LOAD)
        .execution_options(populate_existing=True)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise ApiException(404, "collaboration_not_found", "Institutional collaboration not found")
    return row


def _collab_out(row: InstitutionalCollaboration) -> InstitutionalCollaborationOut:
    return InstitutionalCollaborationOut(
        id=row.id,
        institution_a_id=row.institution_a_id,
        institution_b_id=row.institution_b_id,
        type=row.type,
        status=row.status,
        start_date=row.start_date,
        end_date=row.end_date,
        description=row.description,
        institution_a=(
            InstitutionOut.model_validate(row.institution_a) if row.institution_a else None
        ),
        institution_b=(
            InstitutionOut.model_validate(row.institution_b) if row.institution_b else None
        ),
        created_at=row.created_at,
    )


async def _require_institution(db: AsyncSession, institution_id: uuid.UUID) -> Institution:
    institution = await db.get(Institution, institution_id)
    if institution is None or institution.deleted_at is not None:
        raise ApiException(404, "institution_not_found", "Institution not found")
    return institution


@router.get(
    "/institutional-collaborations",
    response_model=Page[InstitutionalCollaborationOut],
)
async def list_institutional_collaborations(
    db: AsyncSession = Depends(get_db),
    institution: uuid.UUID | None = None,
    status: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[InstitutionalCollaborationOut]:
    stmt = select(InstitutionalCollaboration).where(
        InstitutionalCollaboration.deleted_at.is_(None)
    )
    if institution is not None:
        stmt = stmt.where(
            or_(
                InstitutionalCollaboration.institution_a_id == institution,
                InstitutionalCollaboration.institution_b_id == institution,
            )
        )
    if status:
        stmt = stmt.where(InstitutionalCollaboration.status == status)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.options(*_COLLAB_LOAD)
            .execution_options(populate_existing=True)
            .order_by(InstitutionalCollaboration.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    ).scalars().all()
    return Page[InstitutionalCollaborationOut](
        items=[_collab_out(item) for item in items], total=total, skip=skip, limit=limit
    )


@router.get(
    "/institutional-collaborations/{collab_id}",
    response_model=InstitutionalCollaborationOut,
)
async def get_institutional_collaboration(
    collab_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> InstitutionalCollaborationOut:
    return _collab_out(await _get_collab_or_404(db, collab_id))


@router.post(
    "/institutional-collaborations",
    response_model=InstitutionalCollaborationOut,
    status_code=201,
    dependencies=[Depends(require_roles("system_admin", "institution_admin"))],
)
async def create_institutional_collaboration(
    payload: InstitutionalCollaborationCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> InstitutionalCollaborationOut:
    if payload.institution_a_id == payload.institution_b_id:
        raise ApiException(
            400, "self_collaboration", "An institution cannot collaborate with itself"
        )
    await _require_institution(db, payload.institution_a_id)
    await _require_institution(db, payload.institution_b_id)
    left, right = _ordered_pair(payload.institution_a_id, payload.institution_b_id)
    existing = (
        await db.execute(
            select(InstitutionalCollaboration.id).where(
                InstitutionalCollaboration.institution_a_id == left,
                InstitutionalCollaboration.institution_b_id == right,
                InstitutionalCollaboration.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise ApiException(409, "collaboration_exists", "This institution pair already exists")
    row = InstitutionalCollaboration(
        institution_a_id=left,
        institution_b_id=right,
        type=payload.type.strip() or "joint_research",
        status=payload.status.strip() or "active",
        start_date=payload.start_date,
        end_date=payload.end_date,
        description=payload.description,
    )
    db.add(row)
    await db.flush()
    await write_audit_log(
        db,
        action="institutional_collaboration_created",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="institutional_collaboration",
        entity_id=row.id,
        details={"type": row.type},
        ip_address=client_ip(request),
    )
    return _collab_out(await _get_collab_or_404(db, row.id))


@router.patch(
    "/institutional-collaborations/{collab_id}",
    response_model=InstitutionalCollaborationOut,
    dependencies=[Depends(require_roles("system_admin", "institution_admin"))],
)
async def update_institutional_collaboration(
    collab_id: uuid.UUID,
    payload: InstitutionalCollaborationUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> InstitutionalCollaborationOut:
    row = await _get_collab_or_404(db, collab_id)
    changes = payload.model_dump(exclude_unset=True)
    if changes:
        for field, value in changes.items():
            setattr(row, field, value)
        await db.flush()
        await write_audit_log(
            db,
            action="institutional_collaboration_updated",
            category=AuditCategory.USER_ACTIVITY,
            user_id=user.id,
            entity_type="institutional_collaboration",
            entity_id=row.id,
            details={"changed": sorted(changes)},
            ip_address=client_ip(request),
        )
    return _collab_out(await _get_collab_or_404(db, row.id))


@router.delete(
    "/institutional-collaborations/{collab_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles("system_admin", "institution_admin"))],
)
async def delete_institutional_collaboration(
    collab_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    from datetime import UTC, datetime

    row = await _get_collab_or_404(db, collab_id)
    row.deleted_at = datetime.now(UTC)
    await db.flush()
    await write_audit_log(
        db,
        action="institutional_collaboration_deleted",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="institutional_collaboration",
        entity_id=row.id,
        details={},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Institutional collaboration deleted")


@router.get("/collaboration/me", response_model=MyCollaborationProfileOut)
async def my_collaboration_profile(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MyCollaborationProfileOut:
    """The caller's own researcher profile (empty for accounts without one)."""
    profile = await own_researcher_profile(db, user)
    if profile is None:
        return MyCollaborationProfileOut()
    return MyCollaborationProfileOut(
        researcher_id=profile.id,
        full_name=f"{profile.first_name} {profile.last_name}".strip(),
    )


@router.get("/collaboration/co-authors/{researcher_id}", response_model=list[CoAuthorCollabOut])
async def list_co_authors(
    researcher_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[CoAuthorCollabOut]:
    exists = (
        await db.execute(
            select(Researcher.id).where(
                Researcher.id == researcher_id, Researcher.deleted_at.is_(None)
            )
        )
    ).scalar_one_or_none()
    if exists is None:
        raise ApiException(404, "researcher_not_found", "Researcher not found")

    me = aliased(PublicationAuthor)
    other = aliased(PublicationAuthor)
    stmt = (
        select(
            other.researcher_id,
            func.concat(Researcher.first_name, " ", Researcher.last_name).label("full_name"),
            func.count(func.distinct(me.publication_id)).label("shared_publications"),
        )
        .select_from(me)
        .join(
            other,
            and_(
                me.publication_id == other.publication_id,
                me.researcher_id != other.researcher_id,
            ),
        )
        .join(Researcher, Researcher.id == other.researcher_id)
        .join(Publication, Publication.id == me.publication_id)
        .where(
            me.researcher_id == researcher_id,
            Publication.deleted_at.is_(None),
            Researcher.deleted_at.is_(None),
        )
        .group_by(other.researcher_id, Researcher.first_name, Researcher.last_name)
        .order_by(func.count(func.distinct(me.publication_id)).desc())
    )
    rows = (await db.execute(stmt)).all()
    return [
        CoAuthorCollabOut(
            researcher_id=row.researcher_id,
            full_name=row.full_name,
            shared_publications=int(row.shared_publications),
        )
        for row in rows
    ]


def _institution_researcher_ids(institution_id: uuid.UUID):
    via_dept = select(Researcher.id).join(
        Department, Department.id == Researcher.department_id
    ).where(
        Department.institution_id == institution_id,
        Department.deleted_at.is_(None),
        Researcher.deleted_at.is_(None),
    )
    via_aff = select(ResearcherAffiliation.researcher_id).where(
        ResearcherAffiliation.institution_id == institution_id
    )
    return via_dept.union(via_aff)


@router.get("/collaboration/network", response_model=NetworkGraphOut)
@router.get("/collaboration/graph", response_model=NetworkGraphOut)
async def collaboration_network(
    db: AsyncSession = Depends(get_db),
    institution_id: uuid.UUID | None = None,
    year_from: int | None = Query(default=None, ge=1, le=9999),
    year_to: int | None = Query(default=None, ge=1, le=9999),
    limit: int = Query(200, ge=1, le=2000),
) -> NetworkGraphOut:
    """Co-authorship graph built with SQL aggregation (not Python pair loops)."""
    left = aliased(PublicationAuthor)
    right = aliased(PublicationAuthor)
    weight = func.count().label("weight")
    edge_stmt = (
        select(
            left.researcher_id.label("source_id"),
            right.researcher_id.label("target_id"),
            weight,
        )
        .join(
            right,
            and_(
                left.publication_id == right.publication_id,
                left.researcher_id < right.researcher_id,
            ),
        )
        .join(Publication, Publication.id == left.publication_id)
        .where(Publication.deleted_at.is_(None))
    )
    if year_from is not None:
        edge_stmt = edge_stmt.where(Publication.year >= year_from)
    if year_to is not None:
        edge_stmt = edge_stmt.where(Publication.year <= year_to)
    if institution_id is not None:
        inst_ids = _institution_researcher_ids(institution_id)
        edge_stmt = edge_stmt.where(
            left.researcher_id.in_(inst_ids),
            right.researcher_id.in_(inst_ids),
        )
    edge_stmt = edge_stmt.group_by(left.researcher_id, right.researcher_id).order_by(
        weight.desc()
    ).limit(limit)
    edge_rows = (await db.execute(edge_stmt)).all()
    edges = [
        NetworkEdgeOut(source=row.source_id, target=row.target_id, weight=int(row.weight))
        for row in edge_rows
    ]
    node_id_set = {row.source_id for row in edge_rows} | {row.target_id for row in edge_rows}
    if not node_id_set:
        return NetworkGraphOut(nodes=[], edges=[], links=[])

    pub_counts = (
        select(
            PublicationAuthor.researcher_id.label("researcher_id"),
            func.count(func.distinct(PublicationAuthor.publication_id)).label("pub_count"),
        )
        .join(Publication, Publication.id == PublicationAuthor.publication_id)
        .where(
            Publication.deleted_at.is_(None),
            PublicationAuthor.researcher_id.in_(node_id_set),
        )
        .group_by(PublicationAuthor.researcher_id)
        .subquery()
    )
    node_stmt = (
        select(
            Researcher.id,
            func.concat(Researcher.first_name, " ", Researcher.last_name).label("name"),
            Institution.name.label("institution"),
            func.coalesce(pub_counts.c.pub_count, 0).label("publication_count"),
        )
        .outerjoin(Department, Department.id == Researcher.department_id)
        .outerjoin(Institution, Institution.id == Department.institution_id)
        .outerjoin(pub_counts, pub_counts.c.researcher_id == Researcher.id)
        .where(Researcher.id.in_(node_id_set), Researcher.deleted_at.is_(None))
    )
    node_rows = (await db.execute(node_stmt)).all()
    nodes = [
        NetworkNodeOut(
            id=row.id,
            name=row.name,
            institution=row.institution,
            publication_count=int(row.publication_count),
        )
        for row in node_rows
    ]

    # Shared-publication titles per edge, from a single query over the node set.
    pub_rows = (
        await db.execute(
            select(Publication.id, Publication.title, PublicationAuthor.researcher_id)
            .join(PublicationAuthor, PublicationAuthor.publication_id == Publication.id)
            .where(
                Publication.deleted_at.is_(None),
                PublicationAuthor.researcher_id.in_(node_id_set),
            )
        )
    ).all()
    titles: dict[uuid.UUID, str] = {}
    authors_by_publication: dict[uuid.UUID, set[uuid.UUID]] = {}
    for pub_id, title, researcher_id in pub_rows:
        titles[pub_id] = title
        authors_by_publication.setdefault(pub_id, set()).add(researcher_id)
    for edge in edges:
        edge.publications = [
            titles[pub_id]
            for pub_id, authors in authors_by_publication.items()
            if edge.source in authors and edge.target in authors
        ]

    return NetworkGraphOut(nodes=nodes, edges=edges, links=edges)
