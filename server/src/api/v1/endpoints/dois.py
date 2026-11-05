import random
import string
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import require_permission
from src.core.audit import record_audit
from src.core.ownership import can_manage_publication, is_researcher
from src.db.session import get_db
from src.models.publication import Publication
from src.models.user import User

router = APIRouter()


class DOIMintRequest(BaseModel):
    publication_id: int
    prefix: str = "10.1038"


class DOIMintResponse(BaseModel):
    success: bool
    doi: str
    publication_id: int


@router.post("/mint", response_model=DOIMintResponse)
async def mint_doi(
    request: DOIMintRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("dois.mint")),
) -> Any:
    result = await db.execute(
        select(Publication).where(
            Publication.id == request.publication_id,
            Publication.is_deleted == False,  # noqa: E712
        )
    )
    pub = result.scalars().first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")

    # Scope: own publications / own institution / all (admin).
    if not await can_manage_publication(db, current_user, pub):
        raise HTTPException(
            status_code=403,
            detail="You can only mint DOIs for your own publications or your institution's.",
        )
    # Researchers may only mint DOIs for published work.
    if is_researcher(current_user) and pub.status != "Published":
        raise HTTPException(
            status_code=403,
            detail="A DOI can only be minted for a published publication.",
        )

    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    doi = f"{request.prefix}/scicollab.{suffix}"
    
    pub.doi = doi
    await record_audit(
        db,
        actor=current_user.name,
        action="minted DOI",
        target=pub.title,
        category="Data",
    )
    await db.commit()
    return DOIMintResponse(success=True, doi=doi, publication_id=pub.id)
