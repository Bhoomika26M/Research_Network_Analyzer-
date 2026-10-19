"""Researcher profiles: filtered list, detail, CRUD and skills/interests/affiliations."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.errors import ApiException
from app.models.enums import AuditCategory, UserRole
from app.models.institution import Department, Institution
from app.models.publication import Citation, Publication, PublicationAuthor
from app.models.researcher import (
    Researcher,
    ResearcherAffiliation,
    ResearcherInterest,
    ResearcherSkill,
)
from app.models.user import User
from app.schemas import (
    AffiliationIn,
    AffiliationOut,
    DepartmentOut,
    InstitutionOut,
    MessageResponse,
    Page,
    PublicationBriefOut,
    ResearcherCreate,
    ResearcherOut,
    ResearcherProfileOut,
    ResearcherUpdate,
    SkillIn,
    SkillOut,
)
from app.services.audit import client_ip, write_audit_log
from app.services.permissions import can_edit_researcher

router = APIRouter(
    prefix="/api/v1/researchers",
    tags=["researchers"],
    dependencies=[Depends(get_current_user)],
)

_PROFILE_OPTIONS = (
    selectinload(Researcher.department),
    selectinload(Researcher.skills),
    selectinload(Researcher.interests),
    selectinload(Researcher.affiliations).selectinload(ResearcherAffiliation.institution),
    selectinload(Researcher.publication_links).selectinload(PublicationAuthor.publication),
)


async def _get_profile_or_404(db: AsyncSession, researcher_id: uuid.UUID) -> Researcher:
    """Load a live profile with skills, interests, affiliations and publications.

    ``populate_existing`` refreshes an instance already in the identity map so
    ``_profile_out`` never lazy-loads collections after flush (MissingGreenlet).
    """
    result = await db.execute(
        select(Researcher)
        .where(Researcher.id == researcher_id, Researcher.deleted_at.is_(None))
        .options(*_PROFILE_OPTIONS)
        .execution_options(populate_existing=True)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise ApiException(404, "researcher_not_found", "Researcher not found")
    return profile


async def _enrich_researchers(db: AsyncSession, items: list[Researcher]) -> list[ResearcherOut]:
    """Attach email, institution, skills, interests and counts to a page of
    researchers using a fixed number of batched queries (no N+1)."""
    ids = [researcher.id for researcher in items]
    out: dict[uuid.UUID, ResearcherOut] = {
        researcher.id: ResearcherOut.model_validate(researcher) for researcher in items
    }
    if not ids:
        return []

    contact = await db.execute(
        select(
            Researcher.id,
            User.email,
            User.is_active,
            Department.name,
            Department.institution_id,
            Institution.name,
        )
        .outerjoin(User, User.id == Researcher.user_id)
        .outerjoin(Department, Department.id == Researcher.department_id)
        .outerjoin(Institution, Institution.id == Department.institution_id)
        .where(Researcher.id.in_(ids))
    )
    for rich, email, is_active, dept_name, inst_id, inst_name in contact:
        row = out[rich]
        row.email = email
        row.is_active = is_active
        row.department_name = dept_name
        row.institution_id = inst_id
        row.institution_name = inst_name

    for model, field in (
        (ResearcherSkill, "skill_names"),
        (ResearcherInterest, "interest_names"),
    ):
        rows = await db.execute(
            select(model.researcher_id, model.name).where(model.researcher_id.in_(ids))
        )
        buckets: dict[uuid.UUID, list[str]] = {}
        for researcher_id, name in rows:
            buckets.setdefault(researcher_id, []).append(name)
        for researcher_id, names in buckets.items():
            setattr(out[researcher_id], field, sorted(names))

    pub_rows = await db.execute(
        select(
            PublicationAuthor.researcher_id,
            func.count(func.distinct(PublicationAuthor.publication_id)),
        )
        .join(Publication, Publication.id == PublicationAuthor.publication_id)
        .where(
            PublicationAuthor.researcher_id.in_(ids),
            Publication.deleted_at.is_(None),
        )
        .group_by(PublicationAuthor.researcher_id)
    )
    for researcher_id, count in pub_rows:
        out[researcher_id].publications_count = int(count)

    cite_rows = await db.execute(
        select(
            PublicationAuthor.researcher_id,
            func.count(func.distinct(Citation.citing_publication_id)),
        )
        .join(Citation, Citation.cited_publication_id == PublicationAuthor.publication_id)
        .where(PublicationAuthor.researcher_id.in_(ids))
        .group_by(PublicationAuthor.researcher_id)
    )
    for researcher_id, count in cite_rows:
        out[researcher_id].citations_count = int(count)

    return list(out.values())


async def _require_can_edit(db: AsyncSession, user, profile: Researcher) -> None:
    if not await can_edit_researcher(db, user, profile):
        raise ApiException(
            403,
            "forbidden",
            "You do not have permission to edit this researcher profile",
        )


def _profile_out(profile: Researcher) -> ResearcherProfileOut:
    """Assemble the full profile response from eagerly loaded relationships."""
    publications = [
        PublicationBriefOut(
            id=link.publication.id,
            title=link.publication.title,
            year=link.publication.year,
            type=link.publication.type,
            status=link.publication.status,
            doi=link.publication.doi,
            author_order=link.author_order,
            is_corresponding=link.is_corresponding,
        )
        for link in profile.publication_links
        if link.publication.deleted_at is None
    ]
    return ResearcherProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        department_id=profile.department_id,
        first_name=profile.first_name,
        last_name=profile.last_name,
        full_name=profile.full_name,
        title=profile.title,
        bio=profile.bio,
        orcid=profile.orcid,
        created_at=profile.created_at,
        department=DepartmentOut.model_validate(profile.department) if profile.department else None,
        skills=sorted(skill.name for skill in profile.skills),
        interests=sorted(interest.name for interest in profile.interests),
        affiliations=[
            AffiliationOut(
                institution_id=affiliation.institution_id,
                institution=(
                    InstitutionOut.model_validate(affiliation.institution)
                    if affiliation.institution
                    else None
                ),
            )
            for affiliation in profile.affiliations
        ],
        publications=publications,
    )


@router.get("", response_model=Page[ResearcherOut])
async def list_researchers(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None, max_length=100, description="Search first/last name"),
    department_id: uuid.UUID | None = None,
    institution_id: uuid.UUID | None = None,
    skill: str | None = Query(default=None, max_length=255),
    interest: str | None = Query(default=None, max_length=255),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[ResearcherOut]:
    """Paginated researchers with name search and department/institution/skill/interest filters."""
    stmt = select(Researcher).where(Researcher.deleted_at.is_(None))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(Researcher.first_name.ilike(pattern), Researcher.last_name.ilike(pattern))
        )
    if department_id is not None:
        stmt = stmt.where(Researcher.department_id == department_id)
    if institution_id is not None:
        in_department = (
            select(Department.id)
            .where(
                Department.id == Researcher.department_id,
                Department.institution_id == institution_id,
                Department.deleted_at.is_(None),
            )
            .exists()
        )
        affiliated = (
            select(ResearcherAffiliation.researcher_id)
            .where(
                ResearcherAffiliation.researcher_id == Researcher.id,
                ResearcherAffiliation.institution_id == institution_id,
            )
            .exists()
        )
        stmt = stmt.where(or_(in_department, affiliated))
    if skill:
        has_skill = (
            select(ResearcherSkill.researcher_id)
            .where(
                ResearcherSkill.researcher_id == Researcher.id,
                func.lower(ResearcherSkill.name) == skill.lower(),
            )
            .exists()
        )
        stmt = stmt.where(has_skill)
    if interest:
        has_interest = (
            select(ResearcherInterest.researcher_id)
            .where(
                ResearcherInterest.researcher_id == Researcher.id,
                func.lower(ResearcherInterest.name) == interest.lower(),
            )
            .exists()
        )
        stmt = stmt.where(has_interest)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(stmt.order_by(Researcher.created_at.desc()).offset(skip).limit(limit))
    ).scalars().all()
    return Page[ResearcherOut](
        items=await _enrich_researchers(db, items), total=total, skip=skip, limit=limit
    )


@router.get("/{researcher_id}", response_model=ResearcherProfileOut)
async def get_researcher(
    researcher_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ResearcherProfileOut:
    """Full profile: skills, interests, affiliations and publications."""
    return _profile_out(await _get_profile_or_404(db, researcher_id))


@router.post("", response_model=ResearcherProfileOut, status_code=201)
async def create_researcher(
    payload: ResearcherCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ResearcherProfileOut:
    """Create a researcher profile.

    system_admin may link it to any user (or none); anyone else may only
    create a profile linked to their own account.
    """
    if user.role is UserRole.SYSTEM_ADMIN:
        target_user_id = payload.user_id
    else:
        if payload.user_id is not None and payload.user_id != user.id:
            raise ApiException(
                403,
                "forbidden",
                "Only a system_admin can create a profile for another user",
            )
        target_user_id = user.id

    if target_user_id is not None:
        target_user = (
            await db.execute(
                select(User).where(User.id == target_user_id, User.deleted_at.is_(None))
            )
        ).scalar_one_or_none()
        if target_user is None:
            raise ApiException(404, "user_not_found", "User not found")
        already_linked = (
            await db.execute(select(Researcher.id).where(Researcher.user_id == target_user_id))
        ).scalar_one_or_none()
        if already_linked is not None:
            raise ApiException(409, "profile_exists", "This user already has a researcher profile")

    department = None
    if payload.department_id is not None:
        department = await db.get(Department, payload.department_id)
        if department is None or department.deleted_at is not None:
            raise ApiException(404, "department_not_found", "Department not found")

    if payload.orcid:
        orcid_taken = (
            await db.execute(
                select(Researcher.id).where(func.lower(Researcher.orcid) == payload.orcid.lower())
            )
        ).scalar_one_or_none()
        if orcid_taken is not None:
            raise ApiException(409, "orcid_taken", "A researcher with this ORCID already exists")

    profile = Researcher(
        first_name=payload.first_name,
        last_name=payload.last_name,
        title=payload.title,
        bio=payload.bio,
        orcid=payload.orcid,
        department_id=department.id if department is not None else None,
        user_id=target_user_id,
    )
    if department is not None:
        profile.department = department
    db.add(profile)
    await db.flush()
    await write_audit_log(
        db,
        action="researcher_created",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="researcher",
        entity_id=profile.id,
        details={
            "name": profile.full_name,
            "user_id": str(target_user_id) if target_user_id else None,
        },
        ip_address=client_ip(request),
    )
    # Re-select with eager loads: freshly flushed objects have no collections
    # loaded yet, and lazy-loading them outside of an await raises in async.
    return _profile_out(await _get_profile_or_404(db, profile.id))


@router.patch("/{researcher_id}", response_model=ResearcherProfileOut)
async def update_researcher(
    researcher_id: uuid.UUID,
    payload: ResearcherUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ResearcherProfileOut:
    """Update a profile: the owner, the institution_admin of their institution, or system_admin."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)

    changes = payload.model_dump(exclude_unset=True)
    if changes.get("orcid"):
        orcid_taken = (
            await db.execute(
                select(Researcher.id).where(
                    func.lower(Researcher.orcid) == changes["orcid"].lower(),
                    Researcher.id != profile.id,
                )
            )
        ).scalar_one_or_none()
        if orcid_taken is not None:
            raise ApiException(409, "orcid_taken", "A researcher with this ORCID already exists")
    if "department_id" in changes and changes["department_id"] is not None:
        department = await db.get(Department, changes["department_id"])
        if department is None or department.deleted_at is not None:
            raise ApiException(404, "department_not_found", "Department not found")

    if changes:
        for field, value in changes.items():
            setattr(profile, field, value)
        await db.flush()
        await write_audit_log(
            db,
            action="researcher_updated",
            category=AuditCategory.USER_ACTIVITY,
            user_id=user.id,
            entity_type="researcher",
            entity_id=profile.id,
            details={"changed": sorted(changes)},
            ip_address=client_ip(request),
        )
    return _profile_out(await _get_profile_or_404(db, profile.id))


@router.delete("/{researcher_id}", response_model=MessageResponse)
async def delete_researcher(
    researcher_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    """Soft-delete a profile: the owner, their institution_admin, or system_admin (audited)."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)
    profile.deleted_at = datetime.now(UTC)
    await db.flush()
    await write_audit_log(
        db,
        action="researcher_deleted",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="researcher",
        entity_id=profile.id,
        details={"name": profile.full_name},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Researcher deleted")


# ---- Skills -----------------------------------------------------------------


@router.post("/{researcher_id}/skills", response_model=SkillOut, status_code=201)
async def add_skill(
    researcher_id: uuid.UUID,
    payload: SkillIn,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> SkillOut:
    """Add a skill to a profile (same edit permissions as the profile)."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)
    already = (
        await db.execute(
            select(ResearcherSkill.name).where(
                ResearcherSkill.researcher_id == profile.id,
                func.lower(ResearcherSkill.name) == payload.name.lower(),
            )
        )
    ).scalar_one_or_none()
    if already is not None:
        raise ApiException(409, "skill_exists", "This skill is already on the profile")
    db.add(ResearcherSkill(researcher_id=profile.id, name=payload.name))
    await db.flush()
    return SkillOut(name=payload.name)


@router.delete("/{researcher_id}/skills/{name}", response_model=MessageResponse)
async def remove_skill(
    researcher_id: uuid.UUID,
    name: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    """Remove a skill from a profile."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)
    skill = (
        await db.execute(
            select(ResearcherSkill).where(
                ResearcherSkill.researcher_id == profile.id,
                func.lower(ResearcherSkill.name) == name.lower(),
            )
        )
    ).scalar_one_or_none()
    if skill is None:
        raise ApiException(404, "skill_not_found", "Skill not found on this profile")
    await db.delete(skill)
    await db.flush()
    return MessageResponse(message="Skill removed")


# ---- Research interests -----------------------------------------------------


@router.post("/{researcher_id}/interests", response_model=SkillOut, status_code=201)
async def add_interest(
    researcher_id: uuid.UUID,
    payload: SkillIn,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> SkillOut:
    """Add a research interest to a profile."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)
    already = (
        await db.execute(
            select(ResearcherInterest.name).where(
                ResearcherInterest.researcher_id == profile.id,
                func.lower(ResearcherInterest.name) == payload.name.lower(),
            )
        )
    ).scalar_one_or_none()
    if already is not None:
        raise ApiException(409, "interest_exists", "This interest is already on the profile")
    db.add(ResearcherInterest(researcher_id=profile.id, name=payload.name))
    await db.flush()
    return SkillOut(name=payload.name)


@router.delete("/{researcher_id}/interests/{name}", response_model=MessageResponse)
async def remove_interest(
    researcher_id: uuid.UUID,
    name: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    """Remove a research interest from a profile."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)
    interest = (
        await db.execute(
            select(ResearcherInterest).where(
                ResearcherInterest.researcher_id == profile.id,
                func.lower(ResearcherInterest.name) == name.lower(),
            )
        )
    ).scalar_one_or_none()
    if interest is None:
        raise ApiException(404, "interest_not_found", "Research interest not found on this profile")
    await db.delete(interest)
    await db.flush()
    return MessageResponse(message="Research interest removed")


# ---- Affiliations -----------------------------------------------------------


@router.post("/{researcher_id}/affiliations", response_model=AffiliationOut, status_code=201)
async def add_affiliation(
    researcher_id: uuid.UUID,
    payload: AffiliationIn,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> AffiliationOut:
    """Affiliate a profile with an institution."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)
    institution = await db.get(Institution, payload.institution_id)
    if institution is None or institution.deleted_at is not None:
        raise ApiException(404, "institution_not_found", "Institution not found")
    already = (
        await db.execute(
            select(ResearcherAffiliation.researcher_id).where(
                ResearcherAffiliation.researcher_id == profile.id,
                ResearcherAffiliation.institution_id == institution.id,
            )
        )
    ).scalar_one_or_none()
    if already is not None:
        raise ApiException(
            409, "affiliation_exists", "Already affiliated with this institution"
        )
    db.add(
        ResearcherAffiliation(researcher_id=profile.id, institution_id=institution.id)
    )
    await db.flush()
    return AffiliationOut(
        institution_id=institution.id,
        institution=InstitutionOut.model_validate(institution),
    )


@router.delete(
    "/{researcher_id}/affiliations/{institution_id}", response_model=MessageResponse
)
async def remove_affiliation(
    researcher_id: uuid.UUID,
    institution_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    """Remove an institution affiliation from a profile."""
    profile = await _get_profile_or_404(db, researcher_id)
    await _require_can_edit(db, user, profile)
    affiliation = (
        await db.execute(
            select(ResearcherAffiliation).where(
                ResearcherAffiliation.researcher_id == profile.id,
                ResearcherAffiliation.institution_id == institution_id,
            )
        )
    ).scalar_one_or_none()
    if affiliation is None:
        raise ApiException(404, "affiliation_not_found", "Affiliation not found")
    await db.delete(affiliation)
    await db.flush()
    return MessageResponse(message="Affiliation removed")
