from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.link import PublicationLink
from src.models.user import User
from src.schemas.link import LinkResponse, LinkCreate, LinkUpdate

router = APIRouter()


@router.get("/", response_model=List[LinkResponse])
async def list_links(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(PublicationLink))
    return result.scalars().all()


@router.post("/", response_model=LinkResponse)
async def create_link(
    link_in: LinkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("publications.create")),
) -> Any:
    link = PublicationLink(**link_in.model_dump())
    db.add(link)
    await record_audit(
        db,
        actor=current_user.name,
        action="created link",
        target=f"{link.sourceTitle} → {link.targetTitle}",
    )
    await db.commit()
    await db.refresh(link)
    return link


@router.put("/{link_id}", response_model=LinkResponse)
async def update_link(
    link_id: int,
    link_in: LinkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("publications.create")),
) -> Any:
    result = await db.execute(select(PublicationLink).where(PublicationLink.id == link_id))
    link = result.scalars().first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    for field, value in link_in.model_dump(exclude_unset=True).items():
        setattr(link, field, value)
    await record_audit(
        db,
        actor=current_user.name,
        action="updated link",
        target=f"{link.sourceTitle} → {link.targetTitle}",
    )
    await db.commit()
    await db.refresh(link)
    return link


@router.delete("/{link_id}", response_model=dict)
async def delete_link(
    link_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("publications.create")),
) -> Any:
    result = await db.execute(select(PublicationLink).where(PublicationLink.id == link_id))
    link = result.scalars().first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    await record_audit(
        db,
        actor=current_user.name,
        action="deleted link",
        target=f"{link.sourceTitle} → {link.targetTitle}",
    )
    await db.delete(link)
    await db.commit()
    return {"success": True}
