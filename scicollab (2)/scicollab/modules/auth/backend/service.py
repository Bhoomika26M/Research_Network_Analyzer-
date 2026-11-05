# modules/auth/backend/service.py

from datetime import timedelta
from typing import Optional

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from .models import User
from .schemas import UserCreate, LoginInput

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    hashed = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed,
        role=user_in.role,
        institution_id=user_in.institution_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def generate_tokens(user: User) -> dict:
    data = {"sub": user.id, "role": user.role}
    access = create_access_token(data, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh = create_refresh_token(data, expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
