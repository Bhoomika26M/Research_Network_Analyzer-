from datetime import datetime, timedelta
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission, require_any_permission
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.publication import Publication
from src.models.review import Review
from src.models.user import User
from src.schemas.publication import PublicationResponse, PublicationCreate, PublicationUpdate

router = APIRouter()


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
    pub = Publication(**pub_in.model_dump())
    db.add(pub)
    await record_audit(db, actor=current_user.name, action="created publication", target=pub.title)
    await db.commit()
    await db.refresh(pub)

    # Automatically create review assignment if status is 'Under Review'
    if pub.status == "Under Review":
        authors_str = ", ".join(pub.authors) if isinstance(pub.authors, list) else str(pub.authors)
        review = Review(
            pub_id=pub.id,
            pub_title=pub.title,
            pub_author=authors_str,
            pub_institution=current_user.institution or "Research Network",
            pub_abstract=pub.abstract,
            pub_venue=pub.journal,
            pub_type=pub.type or "Journal",
            submitted_date=datetime.utcnow().strftime("%b %d, %Y"),
            deadline=(datetime.utcnow() + timedelta(days=14)).strftime("%b %d, %Y"),
            status="Pending",
            reviewer_name="Prof. James Okafor",
        )
        db.add(review)
        await record_audit(
            db,
            actor=current_user.name,
            action="submitted publication for peer review",
            target=pub.title,
            category="Data",
        )
        await db.commit()

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


@router.put("/{pub_id}", response_model=PublicationResponse)
async def update_publication(
    pub_id: int,
    pub_in: PublicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_permission("publications.create", "publications.approve")),
) -> Any:
    result = await db.execute(
        select(Publication).where(Publication.id == pub_id, Publication.is_deleted == False)
    )
    pub = result.scalars().first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    old_status = pub.status
    for field, value in pub_in.model_dump(exclude_unset=True).items():
        setattr(pub, field, value)

    # If publication was submitted for review or transitioned to Under Review
    if pub.status == "Under Review" and old_status != "Under Review":
        authors_str = ", ".join(pub.authors) if isinstance(pub.authors, list) else str(pub.authors)
        # Check if existing review exists
        rev_res = await db.execute(select(Review).where(Review.pub_id == pub.id))
        existing_rev = rev_res.scalars().first()
        if existing_rev:
            existing_rev.status = "Pending"
            existing_rev.decision = None
            existing_rev.pub_title = pub.title
            existing_rev.pub_author = authors_str
            existing_rev.pub_abstract = pub.abstract
            existing_rev.pub_venue = pub.journal
            existing_rev.submitted_date = datetime.utcnow().strftime("%b %d, %Y")
            existing_rev.deadline = (datetime.utcnow() + timedelta(days=14)).strftime("%b %d, %Y")
        else:
            new_rev = Review(
                pub_id=pub.id,
                pub_title=pub.title,
                pub_author=authors_str,
                pub_institution=current_user.institution or "Research Network",
                pub_abstract=pub.abstract,
                pub_venue=pub.journal,
                pub_type=pub.type or "Journal",
                submitted_date=datetime.utcnow().strftime("%b %d, %Y"),
                deadline=(datetime.utcnow() + timedelta(days=14)).strftime("%b %d, %Y"),
                status="Pending",
                reviewer_name="Prof. James Okafor",
            )
            db.add(new_rev)
        await record_audit(
            db,
            actor=current_user.name,
            action="submitted publication for peer review",
            target=pub.title,
            category="Data",
        )

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
