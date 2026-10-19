"""Permission helpers shared by the content routes.

An ``institution_admin`` *manages* an institution when their own researcher
profile sits in a department of that institution or holds an affiliation
with it (there is no dedicated institution column on ``users``).
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import UserRole
from app.models.institution import Department
from app.models.project import Project, ProjectMember
from app.models.publication import Publication, PublicationAuthor
from app.models.researcher import Researcher, ResearcherAffiliation
from app.models.user import User


async def own_researcher_profile(db: AsyncSession, user: User) -> Researcher | None:
    """The researcher profile linked to this user account, if any."""
    result = await db.execute(
        select(Researcher).where(Researcher.user_id == user.id, Researcher.deleted_at.is_(None))
    )
    return result.scalar_one_or_none()


async def researcher_institution_ids(
    db: AsyncSession, researcher: Researcher
) -> set[uuid.UUID]:
    """Institutions a researcher belongs to: department's + explicit affiliations."""
    ids: set[uuid.UUID] = set()
    if researcher.department_id is not None:
        dept_institution = (
            await db.execute(
                select(Department.institution_id).where(
                    Department.id == researcher.department_id,
                    Department.deleted_at.is_(None),
                )
            )
        ).scalar_one_or_none()
        if dept_institution is not None:
            ids.add(dept_institution)
    affiliated = await db.execute(
        select(ResearcherAffiliation.institution_id).where(
            ResearcherAffiliation.researcher_id == researcher.id
        )
    )
    ids.update(affiliated.scalars())
    return ids


async def managed_institution_ids(db: AsyncSession, user: User) -> set[uuid.UUID] | None:
    """``None`` = manages every institution (system_admin); empty set = manages none."""
    if user.role is UserRole.SYSTEM_ADMIN:
        return None
    if user.role is not UserRole.INSTITUTION_ADMIN:
        return set()
    profile = await own_researcher_profile(db, user)
    if profile is None:
        return set()
    return await researcher_institution_ids(db, profile)


async def can_edit_researcher(db: AsyncSession, user: User, researcher: Researcher) -> bool:
    """system_admin: always; the owner: always; institution_admin: if in their institution."""
    if user.role is UserRole.SYSTEM_ADMIN:
        return True
    if researcher.user_id is not None and researcher.user_id == user.id:
        return True
    if user.role is UserRole.INSTITUTION_ADMIN:
        managed = await managed_institution_ids(db, user)
        if not managed:
            return False
        return bool(managed & await researcher_institution_ids(db, researcher))
    return False


async def publication_is_owner(db: AsyncSession, user: User, publication: Publication) -> bool:
    """Owner = the user who uploaded it, or whose researcher profile co-authored it."""
    if publication.uploaded_by is not None and publication.uploaded_by == user.id:
        return True
    profile = await own_researcher_profile(db, user)
    if profile is None:
        return False
    link = await db.execute(
        select(PublicationAuthor.publication_id).where(
            PublicationAuthor.publication_id == publication.id,
            PublicationAuthor.researcher_id == profile.id,
        )
    )
    return link.scalar_one_or_none() is not None


def can_create_project(user: User) -> bool:
    return user.role in (UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_ADMIN, UserRole.RESEARCHER)


async def can_edit_project(db: AsyncSession, user: User, project: Project) -> bool:
    """system_admin; institution_admin of the project's institution; or a project member."""
    if user.role is UserRole.SYSTEM_ADMIN:
        return True
    if user.role is UserRole.INSTITUTION_ADMIN:
        managed = await managed_institution_ids(db, user)
        if managed is None:
            return True
        if project.institution_id is not None and project.institution_id in managed:
            return True
    profile = await own_researcher_profile(db, user)
    if profile is None:
        return False
    link = await db.execute(
        select(ProjectMember.project_id).where(
            ProjectMember.project_id == project.id,
            ProjectMember.researcher_id == profile.id,
        )
    )
    return link.scalar_one_or_none() is not None
