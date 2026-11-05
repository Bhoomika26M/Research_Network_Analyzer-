from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.publication import Publication
from src.models.review import Review
from src.models.user import User
from src.schemas.review import ReviewResponse, ReviewCreate, ReviewUpdate

router = APIRouter()


@router.get("/", response_model=List[ReviewResponse])
async def list_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Review))
    return result.scalars().all()


@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_in: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    review = Review(**review_in.model_dump())
    db.add(review)
    await record_audit(
        db,
        actor=current_user.name,
        action="created review assignment",
        target=review.pub_title,
    )
    await db.commit()
    await db.refresh(review)
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review_in: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    for field, value in review_in.model_dump(exclude_unset=True).items():
        setattr(review, field, value)

    # Automatically synchronize review decision to the parent Publication status
    if review_in.decision:
        pub_res = await db.execute(
            select(Publication).where(Publication.id == review.pub_id, Publication.is_deleted == False)
        )
        pub = pub_res.scalars().first()
        if pub:
            if review_in.decision == "Approved":
                pub.status = "Published"
            elif review_in.decision == "Rejected":
                pub.status = "Rejected"
            elif review_in.decision == "Revisions Required":
                pub.status = "Draft"
            await record_audit(
                db,
                actor=current_user.name,
                action=f"peer review decision applied: {review_in.decision.lower()} publication",
                target=pub.title,
                category="Data",
            )

    await record_audit(
        db,
        actor=current_user.name,
        action=f"submitted review decision: {review_in.decision or 'updated'}",
        target=review.pub_title,
        category="Data",
    )
    await db.commit()
    await db.refresh(review)
    return review


@router.delete("/{review_id}", response_model=dict)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    await db.delete(review)
    await db.commit()
    return {"success": True}
