"""Role-protected dashboards with chart series."""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_roles
from app.api.routes.conferences import _LOAD_OPTIONS as _CONF_LOAD
from app.api.routes.conferences import _to_out as conference_to_out
from app.api.routes.projects import _LOAD_OPTIONS as _PROJ_LOAD
from app.api.routes.projects import _to_out as project_to_out
from app.api.routes.publications import _LOAD_OPTIONS as _PUB_LOAD
from app.api.routes.publications import _to_out as publication_to_out
from app.core.errors import ApiException
from app.models.collaboration import InstitutionalCollaboration
from app.models.conference import Conference, ConferenceParticipation
from app.models.enums import ProjectStatus, UserRole
from app.models.institution import Department, Institution
from app.models.project import Project, ProjectMember
from app.models.publication import Citation, Publication, PublicationAuthor
from app.models.researcher import Researcher
from app.models.user import User
from app.schemas.dashboard import (
    AdminDashboardOut,
    InstitutionAnalyticsRow,
    InstitutionDashboardOut,
    ResearcherDashboardOut,
    RoleCount,
    TypeCount,
    YearCount,
)
from app.services.permissions import (
    managed_institution_ids,
    own_researcher_profile,
)

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["dashboards"],
    dependencies=[Depends(get_current_user)],
)


async def _year_counts(db: AsyncSession, extra=None) -> list[YearCount]:
    stmt = (
        select(Publication.year, func.count().label("count"))
        .where(Publication.deleted_at.is_(None))
        .group_by(Publication.year)
        .order_by(Publication.year)
    )
    if extra is not None:
        stmt = stmt.where(extra)
    rows = (await db.execute(stmt)).all()
    return [YearCount(year=int(row.year), count=int(row.count)) for row in rows]


async def _type_counts(db: AsyncSession, extra=None) -> list[TypeCount]:
    stmt = (
        select(Publication.type, func.count().label("count"))
        .where(Publication.deleted_at.is_(None))
        .group_by(Publication.type)
        .order_by(func.count().desc())
    )
    if extra is not None:
        stmt = stmt.where(extra)
    rows = (await db.execute(stmt)).all()
    return [TypeCount(type=str(row.type), count=int(row.count)) for row in rows]


def _authored_by(researcher_id: uuid.UUID):
    return (
        select(PublicationAuthor.publication_id)
        .where(
            PublicationAuthor.publication_id == Publication.id,
            PublicationAuthor.researcher_id == researcher_id,
        )
        .exists()
    )


@router.get("/researcher", response_model=ResearcherDashboardOut)
async def researcher_dashboard(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ResearcherDashboardOut:
    profile = await own_researcher_profile(db, user)
    if profile is None:
        return ResearcherDashboardOut(
            publications_count=0,
            projects_count=0,
            conferences_count=0,
            collaborators_count=0,
            citations_incoming=0,
            publications_per_year=[],
            publications_by_type=[],
            recent_publications=[],
            recent_projects=[],
            upcoming_conferences=[],
        )

    authored = _authored_by(profile.id)
    pub_count = (
        await db.execute(
            select(func.count()).select_from(Publication).where(
                Publication.deleted_at.is_(None), authored
            )
        )
    ).scalar_one()
    proj_count = (
        await db.execute(
            select(func.count()).select_from(ProjectMember).join(
                Project, Project.id == ProjectMember.project_id
            ).where(
                ProjectMember.researcher_id == profile.id,
                Project.deleted_at.is_(None),
            )
        )
    ).scalar_one()
    conf_count = (
        await db.execute(
            select(func.count()).select_from(ConferenceParticipation).where(
                ConferenceParticipation.researcher_id == profile.id
            )
        )
    ).scalar_one()
    collab_count = (
        await db.execute(
            select(func.count(func.distinct(PublicationAuthor.researcher_id)))
            .select_from(PublicationAuthor)
            .where(
                PublicationAuthor.publication_id.in_(
                    select(PublicationAuthor.publication_id).where(
                        PublicationAuthor.researcher_id == profile.id
                    )
                ),
                PublicationAuthor.researcher_id != profile.id,
            )
        )
    ).scalar_one()
    incoming = (
        await db.execute(
            select(func.count())
            .select_from(Citation)
            .join(
                PublicationAuthor,
                PublicationAuthor.publication_id == Citation.cited_publication_id,
            )
            .where(PublicationAuthor.researcher_id == profile.id)
        )
    ).scalar_one()

    pubs = (
        await db.execute(
            select(Publication)
            .where(Publication.deleted_at.is_(None), authored)
            .options(*_PUB_LOAD)
            .execution_options(populate_existing=True)
            .order_by(Publication.created_at.desc())
            .limit(5)
        )
    ).scalars().all()
    # Materialise immediately: a later `populate_existing` query that nests a
    # `Publication` load would otherwise unload `author_links` on these shared
    # identity-map instances (MissingGreenlet in `_to_out`).
    recent_publications = [publication_to_out(item) for item in pubs]

    projects = (
        await db.execute(
            select(Project)
            .join(ProjectMember, ProjectMember.project_id == Project.id)
            .where(
                Project.deleted_at.is_(None),
                ProjectMember.researcher_id == profile.id,
            )
            .options(*_PROJ_LOAD)
            .execution_options(populate_existing=True)
            .order_by(Project.created_at.desc())
            .limit(5)
        )
    ).scalars().unique().all()
    recent_projects = [project_to_out(item) for item in projects]

    conferences = (
        await db.execute(
            select(Conference)
            .join(
                ConferenceParticipation,
                ConferenceParticipation.conference_id == Conference.id,
            )
            .where(ConferenceParticipation.researcher_id == profile.id)
            .options(*_CONF_LOAD)
            .execution_options(populate_existing=True)
            .order_by(Conference.start_date.desc())
            .limit(5)
        )
    ).scalars().unique().all()
    upcoming_conferences = [conference_to_out(item) for item in conferences]

    return ResearcherDashboardOut(
        publications_count=int(pub_count),
        projects_count=int(proj_count),
        conferences_count=int(conf_count),
        collaborators_count=int(collab_count or 0),
        citations_incoming=int(incoming or 0),
        publications_per_year=await _year_counts(db, authored),
        publications_by_type=await _type_counts(db, authored),
        recent_publications=recent_publications,
        recent_projects=recent_projects,
        upcoming_conferences=upcoming_conferences,
    )


@router.get(
    "/institution",
    response_model=InstitutionDashboardOut,
    dependencies=[Depends(require_roles("institution_admin", "system_admin"))],
)
async def institution_dashboard(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    institution_id: uuid.UUID | None = None,
) -> InstitutionDashboardOut:
    managed = await managed_institution_ids(db, user)
    target = institution_id
    if user.role is not UserRole.SYSTEM_ADMIN:
        if not managed:
            # No institution linked to this admin yet. Return zeros instead of
            # a 403 so the dashboard always renders its cards.
            target = None
        elif target is None:
            target = next(iter(managed))
        elif target not in managed:
            raise ApiException(403, "forbidden", "You do not manage this institution")
    elif target is None:
        first = (
            await db.execute(
                select(Institution.id)
                .where(Institution.deleted_at.is_(None))
                .order_by(Institution.name)
                .limit(1)
            )
        ).scalar_one_or_none()
        target = first

    if target is None:
        return InstitutionDashboardOut(
            institution_id=None,
            departments_count=0,
            researchers_count=0,
            publications_count=0,
            active_projects_count=0,
            collaborations_count=0,
            publications_per_year=[],
            publications_by_type=[],
        )

    dept_count = (
        await db.execute(
            select(func.count()).select_from(Department).where(
                Department.institution_id == target, Department.deleted_at.is_(None)
            )
        )
    ).scalar_one()
    res_count = (
        await db.execute(
            select(func.count()).select_from(Researcher).join(
                Department, Department.id == Researcher.department_id
            ).where(
                Department.institution_id == target,
                Researcher.deleted_at.is_(None),
                Department.deleted_at.is_(None),
            )
        )
    ).scalar_one()
    authored_in_inst = (
        select(PublicationAuthor.publication_id)
        .join(Researcher, Researcher.id == PublicationAuthor.researcher_id)
        .join(Department, Department.id == Researcher.department_id)
        .where(
            PublicationAuthor.publication_id == Publication.id,
            Department.institution_id == target,
            Department.deleted_at.is_(None),
            Researcher.deleted_at.is_(None),
        )
        .exists()
    )
    pub_count = (
        await db.execute(
            select(func.count()).select_from(Publication).where(
                Publication.deleted_at.is_(None), authored_in_inst
            )
        )
    ).scalar_one()
    active_projects = (
        await db.execute(
            select(func.count()).select_from(Project).where(
                Project.institution_id == target,
                Project.deleted_at.is_(None),
                Project.status == ProjectStatus.ACTIVE,
            )
        )
    ).scalar_one()
    collabs = (
        await db.execute(
            select(func.count()).select_from(InstitutionalCollaboration).where(
                InstitutionalCollaboration.deleted_at.is_(None),
                (InstitutionalCollaboration.institution_a_id == target)
                | (InstitutionalCollaboration.institution_b_id == target),
            )
        )
    ).scalar_one()
    return InstitutionDashboardOut(
        institution_id=target,
        departments_count=int(dept_count),
        researchers_count=int(res_count),
        publications_count=int(pub_count),
        active_projects_count=int(active_projects),
        collaborations_count=int(collabs),
        publications_per_year=await _year_counts(db, authored_in_inst),
        publications_by_type=await _type_counts(db, authored_in_inst),
    )


@router.get(
    "/admin",
    response_model=AdminDashboardOut,
    dependencies=[Depends(require_roles("system_admin"))],
)
async def admin_dashboard(db: AsyncSession = Depends(get_db)) -> AdminDashboardOut:
    async def _count(model, extra=None):
        stmt = select(func.count()).select_from(model)
        if extra is not None:
            stmt = stmt.where(extra)
        return int((await db.execute(stmt)).scalar_one())

    users_count = await _count(User, User.deleted_at.is_(None))
    researchers_count = await _count(Researcher, Researcher.deleted_at.is_(None))
    institutions_count = await _count(Institution, Institution.deleted_at.is_(None))
    publications_count = await _count(Publication, Publication.deleted_at.is_(None))
    active_projects_count = await _count(
        Project,
        (Project.deleted_at.is_(None)) & (Project.status == ProjectStatus.ACTIVE),
    )
    conferences_count = await _count(Conference)
    citations_count = await _count(Citation)

    role_rows = (
        await db.execute(
            select(User.role, func.count().label("count"))
            .where(User.deleted_at.is_(None))
            .group_by(User.role)
        )
    ).all()
    inst_rows = (
        await db.execute(
            select(Institution.id, Institution.name).where(Institution.deleted_at.is_(None))
        )
    ).all()
    analytics: list[InstitutionAnalyticsRow] = []
    for inst in inst_rows:
        res_n = (
            await db.execute(
                select(func.count()).select_from(Researcher).join(
                    Department, Department.id == Researcher.department_id
                ).where(
                    Department.institution_id == inst.id,
                    Researcher.deleted_at.is_(None),
                    Department.deleted_at.is_(None),
                )
            )
        ).scalar_one()
        pub_n = (
            await db.execute(
                select(func.count(func.distinct(Publication.id)))
                .select_from(Publication)
                .join(PublicationAuthor, PublicationAuthor.publication_id == Publication.id)
                .join(Researcher, Researcher.id == PublicationAuthor.researcher_id)
                .join(Department, Department.id == Researcher.department_id)
                .where(
                    Department.institution_id == inst.id,
                    Publication.deleted_at.is_(None),
                    Researcher.deleted_at.is_(None),
                )
            )
        ).scalar_one()
        proj_n = (
            await db.execute(
                select(func.count()).select_from(Project).where(
                    Project.institution_id == inst.id, Project.deleted_at.is_(None)
                )
            )
        ).scalar_one()
        analytics.append(
            InstitutionAnalyticsRow(
                institution_id=inst.id,
                name=inst.name,
                researchers=int(res_n),
                publications=int(pub_n),
                projects=int(proj_n),
            )
        )
    return AdminDashboardOut(
        users_count=users_count,
        researchers_count=researchers_count,
        institutions_count=institutions_count,
        publications_count=publications_count,
        active_projects_count=active_projects_count,
        conferences_count=conferences_count,
        citations_count=citations_count,
        users_by_role=[RoleCount(role=str(row.role), count=int(row.count)) for row in role_rows],
        publications_per_year=await _year_counts(db),
        publications_by_type=await _type_counts(db),
        institutions=analytics,
    )
