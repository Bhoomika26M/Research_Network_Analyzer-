from datetime import datetime
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, has_permission, require_permission
from src.core.audit import record_audit
from src.core.ownership import (
    SUBMITTED_STATUSES,
    can_manage_publication,
    is_admin,
)
from src.db.session import get_db
from src.models.publication import Publication
from src.models.user import User
from src.schemas.publication import PublicationResponse, PublicationCreate, PublicationUpdate

router = APIRouter()

# Publishing or rejecting an entry requires the review decision permission.
DECIDED_STATUSES = {"Published", "Rejected"}


class ReviewDecisionRequest(BaseModel):
    decision: str  # approve | reject | return_to_draft
    comments: Optional[str] = None


@router.get("/", response_model=List[PublicationResponse])
async def list_publications(
    year: int = Query(None),
    pub_type: str = Query(None),
    status: str = Query(None),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    query = select(Publication).where(Publication.is_deleted == False)
    if year:
        query = query.where(Publication.year == year)
    if pub_type:
        query = query.where(Publication.type == pub_type)
    if status:
        query = query.where(Publication.status == status)
    if search:
        query = query.where(
            Publication.title.ilike(f"%{search}%") | Publication.abstract.ilike(f"%{search}%")
        )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=PublicationResponse)
async def create_publication(
    pub_in: PublicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("publications.create")),
) -> Any:
    # Publishing/rejecting is a review decision, not a creation shortcut.
    if pub_in.status in DECIDED_STATUSES and not has_permission(
        current_user.role, "publications.review"
    ):
        raise HTTPException(
            status_code=403,
            detail="Only a reviewer or administrator can create a publication as Published or Rejected.",
        )
    pub = Publication(**pub_in.model_dump())
    db.add(pub)
    await db.flush()
    # Ownership link: the creator owns the new publication (users.publications_ids).
    current_user.publications_ids = list(current_user.publications_ids or []) + [pub.id]
    await record_audit(db, actor=current_user.name, action="created publication", target=pub.title)
    await db.commit()
    await db.refresh(pub)
    return pub


@router.get("/{pub_id}", response_model=PublicationResponse)
async def get_publication(
    pub_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(
        select(Publication).where(Publication.id == pub_id, Publication.is_deleted == False)
    )
    pub = result.scalars().first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    return pub


@router.post("/{pub_id}/decision", response_model=PublicationResponse)
async def submit_review_decision(
    pub_id: int,
    body: ReviewDecisionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("publications.review")),
) -> Any:
    """Reviewer/admin decision on a submitted publication.

    This is the only path from Submitted to Published (approve) or back to
    Draft (return_to_draft); reject moves it to Rejected.
    """
    result = await db.execute(
        select(Publication).where(Publication.id == pub_id, Publication.is_deleted == False)
    )
    pub = result.scalars().first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    if pub.status not in SUBMITTED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Review decisions apply only to submitted publications "
                f"(current status: {pub.status})."
            ),
        )

    transitions = {"approve": "Published", "reject": "Rejected", "return_to_draft": "Draft"}
    decision = (body.decision or "").strip().lower()
    if decision not in transitions:
        raise HTTPException(
            status_code=400,
            detail="decision must be one of: approve, reject, return_to_draft",
        )

    previous = pub.status
    pub.status = transitions[decision]
    await record_audit(
        db,
        actor=current_user.name,
        action=f"review decision: {decision} ({previous} → {pub.status})",
        target=pub.title,
    )
    if body.comments:
        await record_audit(
            db,
            actor=current_user.name,
            action="review comments recorded",
            target=pub.title,
        )
    await db.commit()
    await db.refresh(pub)
    return pub


@router.put("/{pub_id}", response_model=PublicationResponse)
async def update_publication(
    pub_id: int,
    pub_in: PublicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("publications.edit")),
) -> Any:
    result = await db.execute(
        select(Publication).where(Publication.id == pub_id, Publication.is_deleted == False)
    )
    pub = result.scalars().first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")

    # Ownership: own publications, or (institution) publications of that institution.
    if not await can_manage_publication(db, current_user, pub):
        raise HTTPException(
            status_code=403,
            detail="You can only edit publications you own or that belong to your institution.",
        )

    updates = pub_in.model_dump(exclude_unset=True)
    new_status = updates.get("status")
    if new_status is not None and new_status != pub.status:
        if pub.status in SUBMITTED_STATUSES:
            raise HTTPException(
                status_code=403,
                detail=(
                    f"This publication is {pub.status}. Moving it to Published, Rejected or "
                    "Draft must go through the review decision endpoint."
                ),
            )
        if new_status in DECIDED_STATUSES and not has_permission(
            current_user.role, "publications.review"
        ):
            raise HTTPException(
                status_code=403,
                detail="Only a reviewer or administrator can publish or reject a publication.",
            )

    for field, value in updates.items():
        setattr(pub, field, value)
    await record_audit(db, actor=current_user.name, action="updated publication", target=pub.title)
    await db.commit()
    await db.refresh(pub)
    return pub


@router.delete("/{pub_id}", response_model=dict)
async def delete_publication(
    pub_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("publications.archive")),
) -> Any:
    result = await db.execute(
        select(Publication).where(Publication.id == pub_id, Publication.is_deleted == False)
    )
    pub = result.scalars().first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    if not is_admin(current_user) and not await can_manage_publication(db, current_user, pub):
        raise HTTPException(
            status_code=403,
            detail="You can only archive publications you own or that belong to your institution.",
        )
    # Soft delete: keep the row (and its DOI, citations, links) for the audit trail.
    pub.is_deleted = True
    pub.deleted_at = datetime.utcnow()
    await record_audit(
        db,
        actor=current_user.name,
        action="deleted publication",
        target=pub.title,
        category="Data",
    )
    await db.commit()
    return {"success": True, "deleted": True}
