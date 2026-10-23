from datetime import datetime
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, has_permission, require_permission
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.user import User
from src.schemas.user import UserResponse, UserUpdate, UserCreate
from src.core.redis import get_cache, set_cache, invalidate_cache
from src.core.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_researchers(
    institution: str = Query(None),
    role: str = Query(None),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    cache_key = f"researchers:{institution}:{role}:{search}"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    query = select(User).where(User.is_deleted == False)
    if institution:
        query = query.where(User.institution == institution)
    if role:
        query = query.where(User.role == role)
    if search:
        query = query.where(User.name.ilike(f"%{search}%"))

    result = await db.execute(query)
    researchers = result.scalars().all()
    
    # Transform for JSON serialization
    serialized = [UserResponse.model_validate(r).model_dump() for r in researchers]
    await set_cache(cache_key, serialized, ttl_seconds=120)
    return researchers


@router.get("/{researcher_id}", response_model=UserResponse)
async def get_researcher(
    researcher_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(
        select(User).where(User.id == researcher_id, User.is_deleted == False)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Researcher not found")
    return user


@router.put("/{researcher_id}", response_model=UserResponse)
async def update_researcher(
    researcher_id: int,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Users may edit their own profile; editing any other user requires admin.
    if current_user.id != researcher_id and not has_permission(current_user.role, "admin.manageUsers"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    result = await db.execute(
        select(User).where(User.id == researcher_id, User.is_deleted == False)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Researcher not found")

    update_data = user_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(user, field, val)

    await record_audit(db, actor=current_user.name, action="updated researcher", target=user.name)
    await db.commit()
    await db.refresh(user)
    await invalidate_cache(f"researchers:*")
    return user


@router.post("/", response_model=UserResponse)
async def create_researcher(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("admin.manageUsers")),
) -> Any:
    """Create a new researcher/user account (invite or add-researcher flow)."""
    existing = await db.execute(select(User).where(User.email == user_in.email))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    initials = user_in.initials or "".join([w[0] for w in user_in.name.split() if w]).upper()[:2] or "US"
    # model_dump() (not exclude_unset) so schema defaults fill required NOT NULL columns.
    data = user_in.model_dump()
    data["initials"] = initials
    data["hashed_password"] = get_password_hash(data.pop("password") or "scicollab-invite")
    data.setdefault("publications_ids", [])

    db_user = User(**data)
    db.add(db_user)
    await record_audit(
        db,
        actor=current_user.name,
        action="created researcher",
        target=db_user.name,
        category="Admin",
    )
    await db.commit()
    await db.refresh(db_user)
    await invalidate_cache(f"researchers:*")
    return db_user


@router.delete("/{researcher_id}", response_model=dict)
async def delete_researcher(
    researcher_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("admin.manageUsers")),
) -> Any:
    """Remove a researcher/user account (admin-only)."""
    result = await db.execute(
        select(User).where(User.id == researcher_id, User.is_deleted == False)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Researcher not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot remove your own account")
    # Soft delete: keep the row for the audit trail and history.
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    await record_audit(
        db,
        actor=current_user.name,
        action="removed researcher",
        target=user.name,
        category="Admin",
    )
    await db.commit()
    await invalidate_cache(f"researchers:*")
    return {"success": True, "deleted": True}
