from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.citation import Citation
from src.models.user import User
from src.schemas.conference import CitationResponse, CitationCreate, CitationUpdate

router = APIRouter()


@router.get("/", response_model=List[CitationResponse])
async def list_citations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Citation))
    return result.scalars().all()


@router.post("/", response_model=CitationResponse)
async def create_citation(
    cit_in: CitationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    citation = Citation(**cit_in.model_dump())
    db.add(citation)
    await record_audit(
        db,
        actor=current_user.name,
        action="created citation",
        target=f"Publication {citation.sourcePubId} → {citation.targetPubId}",
    )
    await db.commit()
    await db.refresh(citation)
    return citation


@router.put("/{citation_id}", response_model=CitationResponse)
async def update_citation(
    citation_id: int,
    cit_in: CitationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Citation).where(Citation.id == citation_id))
    citation = result.scalars().first()
    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")
    for field, value in cit_in.model_dump(exclude_unset=True).items():
        setattr(citation, field, value)
    await record_audit(
        db,
        actor=current_user.name,
        action="updated citation",
        target=f"Citation #{citation.id}",
    )
    await db.commit()
    await db.refresh(citation)
    return citation


@router.delete("/{citation_id}", response_model=dict)
async def delete_citation(
    citation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Citation).where(Citation.id == citation_id))
    citation = result.scalars().first()
    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")
    await record_audit(
        db,
        actor=current_user.name,
        action="deleted citation",
        target=f"Citation #{citation.id}",
    )
    await db.delete(citation)
    await db.commit()
    return {"success": True}
