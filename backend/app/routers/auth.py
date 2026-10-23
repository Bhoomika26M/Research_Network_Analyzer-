from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, Token, ProfileRead, RoleSwitchRequest
from app.auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication & Roles"])

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password and receive a JWT token."""
    res = await db.execute(select(User).where(User.email == credentials.email))
    user = res.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return Token(access_token=token, user=ProfileRead.model_validate(user))

@router.get("/me", response_model=ProfileRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the authenticated user."""
    return current_user

@router.post("/switch-role", response_model=ProfileRead)
async def switch_role(
    req: RoleSwitchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Dev helper to switch active role (Researcher, Institution Admin, System Admin, Reviewer)."""
    valid_roles = ["Researcher", "Institution Admin", "System Admin", "Reviewer"]
    if req.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")

    current_user.role = req.role
    await db.commit()
    await db.refresh(current_user)
    return current_user
