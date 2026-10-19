"""Conferences: CRUD, schedule, registration, presentations and history."""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db, require_roles
from app.core.errors import ApiException
from app.models.conference import Conference, ConferenceParticipation
from app.models.enums import AuditCategory, UserRole
from app.models.publication import Publication
from app.models.researcher import Researcher
from app.schemas.common import Page
from app.schemas.conference import (
    ConferenceCreate,
    ConferenceOut,
    ConferenceRegisterIn,
    ConferenceScheduleItem,
    ConferenceUpdate,
    ParticipationOut,
    PresentationIn,
)
from app.schemas.user import MessageResponse
from app.services.audit import client_ip, write_audit_log
from app.services.notifications import create_notification
from app.services.permissions import own_researcher_profile

router = APIRouter(
    prefix="/api/v1/conferences",
    tags=["conferences"],
    dependencies=[Depends(get_current_user)],
)

_LOAD_OPTIONS = (
    selectinload(Conference.participation_links).selectinload(ConferenceParticipation.researcher),
    selectinload(Conference.participation_links).selectinload(ConferenceParticipation.publication),
)


async def _get_conference_or_404(db: AsyncSession, conference_id: uuid.UUID) -> Conference:
    result = await db.execute(
        select(Conference)
        .where(Conference.id == conference_id)
        .options(*_LOAD_OPTIONS)
        .execution_options(populate_existing=True)
    )
    conference = result.scalar_one_or_none()
    if conference is None:
        raise ApiException(404, "conference_not_found", "Conference not found")
    return conference


def _participation_out(link: ConferenceParticipation, conference: Conference) -> ParticipationOut:
    researcher = link.researcher
    publication = link.publication
    return ParticipationOut(
        researcher_id=link.researcher_id,
        full_name=researcher.full_name if researcher else "",
        publication_id=link.publication_id,
        publication_title=publication.title if publication else None,
        presentation_type=link.presentation_type,
        registration_status=link.registration_status,
        presentation_date=conference.start_date if link.presentation_type else None,
    )


def _to_out(conference: Conference) -> ConferenceOut:
    return ConferenceOut(
        id=conference.id,
        name=conference.name,
        location=conference.location,
        start_date=conference.start_date,
        end_date=conference.end_date,
        website=conference.website,
        submission_deadline=conference.submission_deadline,
        topics=conference.topics,
        created_at=conference.created_at,
        registrations=[
            _participation_out(link, conference) for link in conference.participation_links
        ],
        acronym="".join(word[0] for word in conference.name.split() if word)[:6].upper(),
        registration_count=len(conference.participation_links),
    )


def _can_manage(user) -> bool:
    return user.role in (UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_ADMIN)


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


@router.get("/schedule", response_model=list[ConferenceScheduleItem])
async def conference_schedule(
    db: AsyncSession = Depends(get_db),
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[ConferenceScheduleItem]:
    stmt = select(Conference)
    if date_from is not None:
        stmt = stmt.where(or_(Conference.end_date.is_(None), Conference.end_date >= date_from))
    if date_to is not None:
        stmt = stmt.where(Conference.start_date <= date_to)
    items = (await db.execute(stmt.order_by(Conference.start_date))).scalars().all()
    return [
        ConferenceScheduleItem(
            id=item.id,
            name=item.name,
            location=item.location,
            start_date=item.start_date,
            end_date=item.end_date,
            website=item.website,
        )
        for item in items
    ]


@router.get("/researchers/{researcher_id}/history", response_model=list[ParticipationOut])
async def researcher_conference_history(
    researcher_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[ParticipationOut]:
    await _require_researcher(db, researcher_id)
    result = await db.execute(
        select(ConferenceParticipation)
        .where(ConferenceParticipation.researcher_id == researcher_id)
        .options(
            selectinload(ConferenceParticipation.conference),
            selectinload(ConferenceParticipation.researcher),
            selectinload(ConferenceParticipation.publication),
        )
        .execution_options(populate_existing=True)
    )
    links = result.scalars().all()
    return [
        _participation_out(link, link.conference)
        for link in links
        if link.conference is not None
    ]


@router.get("", response_model=Page[ConferenceOut])
async def list_conferences(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None, max_length=200),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[ConferenceOut]:
    stmt = select(Conference)
    if q:
        stmt = stmt.where(
            or_(Conference.name.ilike(f"%{q}%"), Conference.location.ilike(f"%{q}%"))
        )
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.options(*_LOAD_OPTIONS)
            .execution_options(populate_existing=True)
            .order_by(Conference.start_date.desc())
            .offset(skip)
            .limit(limit)
        )
    ).scalars().all()
    return Page[ConferenceOut](
        items=[_to_out(item) for item in items], total=total, skip=skip, limit=limit
    )


@router.get("/{conference_id}", response_model=ConferenceOut)
async def get_conference(
    conference_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ConferenceOut:
    return _to_out(await _get_conference_or_404(db, conference_id))


@router.post("", response_model=ConferenceOut, status_code=201)
async def create_conference(
    payload: ConferenceCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ConferenceOut:
    if not _can_manage(user):
        raise ApiException(403, "forbidden", "Your role cannot create conferences")
    name = payload.name.strip()
    if not name:
        raise ApiException(400, "invalid_request", "name must not be empty")
    conference = Conference(
        name=name,
        location=payload.location,
        start_date=payload.start_date,
        end_date=payload.end_date,
        website=payload.website,
        submission_deadline=payload.submission_deadline,
        topics=payload.topics,
    )
    db.add(conference)
    await db.flush()
    await write_audit_log(
        db,
        action="conference_created",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="conference",
        entity_id=conference.id,
        details={"name": conference.name},
        ip_address=client_ip(request),
    )
    return _to_out(await _get_conference_or_404(db, conference.id))


@router.patch("/{conference_id}", response_model=ConferenceOut)
async def update_conference(
    conference_id: uuid.UUID,
    payload: ConferenceUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ConferenceOut:
    if not _can_manage(user):
        raise ApiException(403, "forbidden", "Your role cannot update conferences")
    conference = await _get_conference_or_404(db, conference_id)
    changes = payload.model_dump(exclude_unset=True)
    if "name" in changes:
        name = (changes["name"] or "").strip()
        if not name:
            raise ApiException(400, "invalid_request", "name must not be empty")
        changes["name"] = name
    if changes:
        for field, value in changes.items():
            setattr(conference, field, value)
        await db.flush()
        await write_audit_log(
            db,
            action="conference_updated",
            category=AuditCategory.USER_ACTIVITY,
            user_id=user.id,
            entity_type="conference",
            entity_id=conference.id,
            details={"changed": sorted(changes)},
            ip_address=client_ip(request),
        )
    return _to_out(await _get_conference_or_404(db, conference.id))


@router.delete(
    "/{conference_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles("system_admin"))],
)
async def delete_conference(
    conference_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    conference = await _get_conference_or_404(db, conference_id)
    await db.delete(conference)
    await db.flush()
    await write_audit_log(
        db,
        action="conference_deleted",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="conference",
        entity_id=conference_id,
        details={"name": conference.name},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Conference deleted")


@router.post("/{conference_id}/register", response_model=ConferenceOut)
async def register_for_conference(
    conference_id: uuid.UUID,
    payload: ConferenceRegisterIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ConferenceOut:
    conference = await _get_conference_or_404(db, conference_id)
    if payload.researcher_id is not None:
        researcher = await _require_researcher(db, payload.researcher_id)
        profile = await own_researcher_profile(db, user)
        if (
            user.role not in (UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_ADMIN)
            and (profile is None or profile.id != researcher.id)
        ):
            raise ApiException(403, "forbidden", "You can only register your own profile")
    else:
        profile = await own_researcher_profile(db, user)
        if profile is None:
            raise ApiException(400, "no_researcher_profile", "Create a researcher profile first")
        researcher = profile

    if payload.publication_id is not None:
        publication = (
            await db.execute(
                select(Publication).where(
                    Publication.id == payload.publication_id,
                    Publication.deleted_at.is_(None),
                )
            )
        ).scalar_one_or_none()
        if publication is None:
            raise ApiException(404, "publication_not_found", "Publication not found")

    existing = (
        await db.execute(
            select(ConferenceParticipation).where(
                ConferenceParticipation.conference_id == conference.id,
                ConferenceParticipation.researcher_id == researcher.id,
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise ApiException(409, "already_registered", "Already registered for this conference")

    db.add(
        ConferenceParticipation(
            conference_id=conference.id,
            researcher_id=researcher.id,
            publication_id=payload.publication_id,
            presentation_type=payload.presentation_type,
            registration_status="registered",
        )
    )
    await db.flush()
    await create_notification(
        db,
        researcher.user_id,
        f'You are registered for conference "{conference.name}"',
    )
    await write_audit_log(
        db,
        action="conference_registered",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="conference",
        entity_id=conference.id,
        details={"researcher_id": str(researcher.id)},
        ip_address=client_ip(request),
    )
    return _to_out(await _get_conference_or_404(db, conference.id))


@router.post("/{conference_id}/presentations", response_model=ConferenceOut, status_code=201)
async def add_presentation(
    conference_id: uuid.UUID,
    payload: PresentationIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ConferenceOut:
    conference = await _get_conference_or_404(db, conference_id)
    researcher = await _require_researcher(db, payload.researcher_id)
    publication = (
        await db.execute(
            select(Publication).where(
                Publication.id == payload.publication_id, Publication.deleted_at.is_(None)
            )
        )
    ).scalar_one_or_none()
    if publication is None:
        raise ApiException(404, "publication_not_found", "Publication not found")

    link = (
        await db.execute(
            select(ConferenceParticipation).where(
                ConferenceParticipation.conference_id == conference.id,
                ConferenceParticipation.researcher_id == researcher.id,
            )
        )
    ).scalar_one_or_none()
    if link is None:
        link = ConferenceParticipation(
            conference_id=conference.id,
            researcher_id=researcher.id,
            registration_status="registered",
        )
        db.add(link)
    link.publication_id = publication.id
    link.presentation_type = payload.presentation_type
    await db.flush()
    await write_audit_log(
        db,
        action="conference_presentation_added",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="conference",
        entity_id=conference.id,
        details={"publication_id": str(publication.id)},
        ip_address=client_ip(request),
    )
    return _to_out(await _get_conference_or_404(db, conference.id))
