from datetime import timedelta, datetime
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user
from src.core.audit import record_audit
from src.core.redis import invalidate_cache
from src.db.session import get_db
from src.models.user import User
from src.schemas.user import Token, UserResponse
from src.core.security import verify_password, create_access_token, get_password_hash
from src.core.config import settings

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "researcher"
    institution: str = "Unspecified Institution"
    department: str = "General Department"


class LoginJsonRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None


from src.core.security_settings import validate_password_policy


@router.post("/login", response_model=Token)
async def login_json(
    body: LoginJsonRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalars().first()

    if not user or user.is_deleted or not verify_password(body.password, user.hashed_password):
        await record_audit(
            db,
            actor=body.email,
            action="Failed login attempt",
            target="Authentication",
            category="Auth",
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    await record_audit(
        db,
        actor=user.name,
        action="User login successful",
        target=user.email,
        category="Auth",
    )
    await db.commit()

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/register", response_model=Token)
async def register(
    user_in: RegisterRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Enforce password policy
    pwd_error = validate_password_policy(user_in.password)
    if pwd_error:
        raise HTTPException(
            status_code=400,
            detail=pwd_error
        )

    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists."
        )

    initials = "".join([w[0] for w in user_in.name.split() if w]).upper()[:2] or "US"

    db_user = User(
        name=user_in.name,
        initials=initials,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        institution=user_in.institution,
        department=user_in.department,
        bio=f"{user_in.name} registered as {user_in.role}.",
        skills=[],
        interests=[],
        publications_ids=[],
        h_index=0,
        citations_total=0,
    )
    db.add(db_user)
    await record_audit(
        db,
        actor=db_user.name,
        action="User account registered",
        target=db_user.email,
        category="Auth",
    )
    await db.commit()
    await db.refresh(db_user)

    access_token = create_access_token(
        subject=db_user.id,
        role=db_user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Returns info about the currently authenticated user."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    body: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update profile information for the authenticated user."""
    if body.email and body.email != current_user.email:
        existing = await db.execute(select(User).where(User.email == body.email, User.id != current_user.id))
        if existing.scalars().first():
            raise HTTPException(status_code=400, detail="Email is already taken by another account")
        current_user.email = body.email
    if body.name is not None and body.name.strip():
        current_user.name = body.name.strip()
        initials = "".join([w[0] for w in body.name.split() if w]).upper()[:2]
        if initials:
            current_user.initials = initials
    if body.institution is not None:
        current_user.institution = body.institution
    if body.department is not None:
        current_user.department = body.department
    if body.bio is not None:
        current_user.bio = body.bio

    await record_audit(
        db,
        actor=current_user.name,
        action="updated profile settings",
        target=current_user.email,
        category="Auth",
    )
    await db.commit()
    await db.refresh(current_user)
    await invalidate_cache("researchers:*")
    return current_user


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Change password for authenticated user."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    pwd_error = validate_password_policy(body.new_password)
    if pwd_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pwd_error,
        )
    current_user.hashed_password = get_password_hash(body.new_password)
    await record_audit(
        db,
        actor=current_user.name,
        action="changed password",
        target=current_user.email,
        category="Auth",
    )
    await db.commit()
    return {"success": True, "message": "Password changed successfully"}


@router.post("/deactivate")
async def deactivate_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Deactivate authenticated user account."""
    current_user.is_active = "Inactive"
    await record_audit(
        db,
        actor=current_user.name,
        action="deactivated account",
        target=current_user.email,
        category="Auth",
    )
    await db.commit()
    await invalidate_cache("researchers:*")
    return {"success": True, "message": "Account deactivated"}


@router.delete("/me")
async def delete_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Permanently delete authenticated user account."""
    current_user.is_deleted = True
    current_user.deleted_at = datetime.utcnow()
    current_user.is_active = "Inactive"
    await record_audit(
        db,
        actor=current_user.name,
        action="deleted own account",
        target=current_user.email,
        category="Auth",
    )
    await db.commit()
    await invalidate_cache("researchers:*")
    return {"success": True, "message": "Account deleted successfully"}

