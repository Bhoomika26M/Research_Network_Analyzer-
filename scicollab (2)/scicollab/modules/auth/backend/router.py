# modules/auth/backend/router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from . import schemas, service
from app.core.responses import create_success_response, create_error_response

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Simple validation: email must be unique
    existing = service.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = service.create_user(db, user_in)
    tokens = service.generate_tokens(user)
    return tokens

@router.post("/login", response_model=schemas.Token)
def login(form: schemas.LoginInput, db: Session = Depends(get_db)):
    user = service.authenticate_user(db, form.email, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")
    tokens = service.generate_tokens(user)
    return tokens

@router.post("/refresh", response_model=schemas.Token)
def refresh(payload: schemas.RefreshInput):
    # Decode refresh token, verify type
    from app.core.security import decode_token
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    # Grab user from DB to ensure still active
    from modules.auth.backend.models import User
    db = next(get_db())
    user = db.query(User).filter(User.id == data["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return service.generate_tokens(user)

@router.get("/me", response_model=schemas.UserRead)
def read_current_user(current_user: "User" = Depends(require_role('Researcher','Institution Admin','Reviewer','System Admin')):
    return current_user

@router.post("/logout")
def logout():
    # In a real implementation we would blacklist the refresh token.
    # For now just return success.
    return create_success_response(message="Logged out")
