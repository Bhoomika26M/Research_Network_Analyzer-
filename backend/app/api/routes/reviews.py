"""Peer-review assignments and reviewer decisions.

* ``POST /publications/{id}/reviews/assign`` — assign a reviewer user
  (system_admin or institution_admin).
* ``GET  /reviews``                        — a reviewer sees their own, admins see all.
* ``PATCH /reviews/{id}``                  — the assigned reviewer records a decision.

An ``approved`` decision moves a *submitted* publication to ``published``; a
``rejected``/``changes_requested`` decision sends it back to ``draft``. Every
change is written to ``publication_history`` and the authors are notified.
"""

import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.errors import ApiException
from app.models.enums import AuditCategory, PublicationStatus, ReviewStatus, UserRole
from app.models.institution import Department
from app.models.publication import Publication, PublicationAuthor
from app.models.researcher import Researcher
from app.models.review import Review
from app.models.user import User
from app.schemas.common import Page
from app.schemas.review import ReviewAssignIn, ReviewOut, ReviewUpdateIn
from app.services.audit import client_ip, write_audit_log
from app.services.notifications import create_notification

router = APIRouter(
    prefix="/api/v1",
    tags=["reviews"],
    dependencies=[Depends(get_current_user)],
)

_ADMINS = (UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_ADMIN)

# Publication eager-load chain used to reach the co-authors' user accounts.
_PUB_LOAD = (
    selectinload(Publication.author_links)
    .selectinload(PublicationAuthor.researcher)
    .selectinload(Researcher.department)
    .selectinload(Department.institution),
)

_REVIEW_LOAD = (
    selectinload(Review.publication),
    selectinload(Review.reviewer),
)


def _to_out(review: Review) -> ReviewOut:
    publication = review.publication
    reviewer = review.reviewer
    return ReviewOut(
        id=review.id,
        publication_id=review.publication_id,
        publication_title=publication.title if publication else "",
        reviewer_id=review.reviewer_id,
        reviewer_name=reviewer.full_name if reviewer else "",
        status=review.status,
        comments=review.comments,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


async def _get_review_or_404(db: AsyncSession, review_id: uuid.UUID) -> Review:
    """Load a review with its publication + reviewer eager-loaded and refreshed.

    ``populate_existing`` guarantees ``_to_out`` never triggers a lazy load
    (MissingGreenlet) on an instance already in the identity map.
    """
    result = await db.execute(
        select(Review)
        .where(Review.id == review_id)
        .options(*_REVIEW_LOAD)
        .execution_options(populate_existing=True)
    )
    review = result.scalar_one_or_none()
    if review is None:
        raise ApiException(404, "review_not_found", "Review not found")
    return review


async def _get_publication_or_404(db: AsyncSession, publication_id: uuid.UUID) -> Publication:
    result = await db.execute(
        select(Publication)
        .where(Publication.id == publication_id, Publication.deleted_at.is_(None))
        .options(*_PUB_LOAD)
        .execution_options(populate_existing=True)
    )
    publication = result.scalar_one_or_none()
    if publication is None:
        raise ApiException(404, "publication_not_found", "Publication not found")
    return publication


@router.post(
    "/publications/{publication_id}/reviews/assign",
    response_model=ReviewOut,
    status_code=201,
)
async def assign_reviewer(
    publication_id: uuid.UUID,
    payload: ReviewAssignIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ReviewOut:
    """Assign a reviewer user to a publication (system_admin/institution_admin)."""
    if user.role not in _ADMINS:
        raise ApiException(403, "forbidden", "Only admins may assign reviewers")

    publication = await _get_publication_or_404(db, publication_id)

    reviewer = (
        await db.execute(
            select(User).where(
                User.id == payload.reviewer_id,
                User.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if reviewer is None:
        raise ApiException(404, "reviewer_not_found", "Reviewer not found")
    if reviewer.role is not UserRole.REVIEWER:
        raise ApiException(400, "not_a_reviewer", "The selected user is not a reviewer")

    existing = (
        await db.execute(
            select(Review.id).where(
                Review.publication_id == publication.id,
                Review.reviewer_id == reviewer.id,
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise ApiException(409, "already_assigned", "This reviewer is already assigned")

    review = Review(publication_id=publication.id, reviewer_id=reviewer.id)
    db.add(review)
    await db.flush()
    await write_audit_log(
        db,
        action="reviewer_assigned",
        category=AuditCategory.PUBLICATION_HISTORY,
        user_id=user.id,
        entity_type="publication",
        entity_id=publication.id,
        details={"reviewer_id": str(reviewer.id), "review_id": str(review.id)},
        ip_address=client_ip(request),
    )
    await create_notification(
        db,
        reviewer.id,
        f'You have been assigned to review "{publication.title}"',
    )
    return _to_out(await _get_review_or_404(db, review.id))


@router.get("/reviews", response_model=Page[ReviewOut])
async def list_reviews(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    status: ReviewStatus | None = None,
    publication_id: uuid.UUID | None = None,
    mine: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[ReviewOut]:
    """Reviews: a reviewer sees only their own, admins see every review."""
    stmt = select(Review)
    if user.role is UserRole.REVIEWER or mine:
        stmt = stmt.where(Review.reviewer_id == user.id)
    elif user.role not in _ADMINS:
        raise ApiException(403, "forbidden", "Not allowed to list reviews")
    if status is not None:
        stmt = stmt.where(Review.status == status)
    if publication_id is not None:
        stmt = stmt.where(Review.publication_id == publication_id)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.options(*_REVIEW_LOAD)
            .execution_options(populate_existing=True)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    ).scalars().all()
    return Page[ReviewOut](
        items=[_to_out(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.patch("/reviews/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: uuid.UUID,
    payload: ReviewUpdateIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ReviewOut:
    """Record the assigned reviewer's decision (moves the publication, audited)."""
    review = await _get_review_or_404(db, review_id)
    if review.reviewer_id != user.id:
        raise ApiException(403, "forbidden", "Only the assigned reviewer may update this review")

    publication = await _get_publication_or_404(db, review.publication_id)
    review.status = payload.status
    if payload.comments is not None:
        review.comments = payload.comments

    new_status: PublicationStatus | None = None
    if publication.status is PublicationStatus.SUBMITTED:
        if payload.status is ReviewStatus.APPROVED:
            new_status = PublicationStatus.PUBLISHED
        elif payload.status in (ReviewStatus.REJECTED, ReviewStatus.CHANGES_REQUESTED):
            new_status = PublicationStatus.DRAFT
    if new_status is not None:
        publication.status = new_status
    await db.flush()

    await write_audit_log(
        db,
        action="review_decision",
        category=AuditCategory.PUBLICATION_HISTORY,
        user_id=user.id,
        entity_type="publication",
        entity_id=publication.id,
        details={
            "review_id": str(review.id),
            "decision": payload.status.value,
            "publication_status": publication.status.value,
        },
        ip_address=client_ip(request),
    )
    publication = await _get_publication_or_404(db, publication.id)
    for link in publication.author_links:
        author = link.researcher
        if author is None or author.user_id is None or author.user_id == user.id:
            continue
        await create_notification(
            db,
            author.user_id,
            f'Review for "{publication.title}" recorded as {payload.status.value} '
            f"(publication is now {publication.status.value})",
        )
    return _to_out(await _get_review_or_404(db, review.id))
