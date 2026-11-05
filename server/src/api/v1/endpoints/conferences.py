from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.core.audit import record_audit
from src.core.ownership import can_manage_conference
from src.db.session import get_db
from src.models.conference import Conference
from src.models.user import User
from src.schemas.conference import ConferenceResponse, ConferenceCreate, ConferenceUpdate

router = APIRouter()

CONFERENCE_DENIED = (
    "You can only manage conference events for presentations you own "
    "or that belong to your institution."
)


async def _get_conference(db: AsyncSession, conference_id: int) -> Conference:
    result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = result.scalars().first()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    return conf


@router.get("/", response_model=List[ConferenceResponse])
async def list_conferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Conference))
    return result.scalars().all()


@router.post("/", response_model=ConferenceResponse)
async def create_conference(
    conf_in: ConferenceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("conferences.manage")),
) -> Any:
    if not await can_manage_conference(db, current_user, None, conf_in.presentations):
        raise HTTPException(status_code=403, detail=CONFERENCE_DENIED)
    conf = Conference(**conf_in.model_dump())
    db.add(conf)
    await record_audit(db, actor=current_user.name, action="created conference", target=conf.name)
    await db.commit()
    await db.refresh(conf)
    return conf


@router.put("/{conference_id}", response_model=ConferenceResponse)
async def update_conference(
    conference_id: int,
    conf_in: ConferenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("conferences.manage")),
) -> Any:
    conf = await _get_conference(db, conference_id)
    updates = conf_in.model_dump(exclude_unset=True)
    if not await can_manage_conference(db, current_user, conf, updates.get("presentations")):
        raise HTTPException(status_code=403, detail=CONFERENCE_DENIED)
    for field, value in updates.items():
        setattr(conf, field, value)
    await record_audit(db, actor=current_user.name, action="updated conference", target=conf.name)
    await db.commit()
    await db.refresh(conf)
    return conf


@router.delete("/{conference_id}", response_model=dict)
async def delete_conference(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("conferences.manage")),
) -> Any:
    conf = await _get_conference(db, conference_id)
    if not await can_manage_conference(db, current_user, conf):
        raise HTTPException(status_code=403, detail=CONFERENCE_DENIED)
    await record_audit(db, actor=current_user.name, action="deleted conference", target=conf.name)
    await db.delete(conf)
    await db.commit()
    return {"success": True}
