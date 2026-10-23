from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user
from src.core.audit import record_audit
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


@router.post("/login", response_model=Token)
async def login_json(
    body: LoginJsonRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalars().first()

    if not user or user.is_deleted or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

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
        action="registered account",
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
