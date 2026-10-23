from datetime import datetime
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.publication import Publication
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
    current_user: User = Depends(require_permission("publications.approve")),
) -> Any:
    result = await db.execute(
        select(Publication).where(Publication.id == pub_id, Publication.is_deleted == False)
    )
    pub = result.scalars().first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    for field, value in pub_in.model_dump(exclude_unset=True).items():
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
