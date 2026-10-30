# modules/researchers/backend/service.py

from sqlalchemy.orm import Session
from .models import ResearcherProfile
from .schemas import ResearcherCreate, ResearcherUpdate
from modules.auth.backend.models import User

def get_profile_by_user(db: Session, user_id: int) -> ResearcherProfile | None:
    return db.query(ResearcherProfile).filter(ResearcherProfile.user_id == user_id).first()

def create_profile(db: Session, payload: ResearcherCreate) -> ResearcherProfile:
    # Ensure the user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise ValueError("User not found")
    profile = ResearcherProfile(**payload.dict())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def update_profile(db: Session, user_id: int, payload: ResearcherUpdate) -> ResearcherProfile:
    profile = get_profile_by_user(db, user_id)
    if not profile:
        raise ValueError("Profile not found")
    for attr, val in payload.dict(exclude_unset=True).items():
        setattr(profile, attr, val)
    db.commit()
    db.refresh(profile)
    return profile

def delete_profile(db: Session, user_id: int):
    profile = get_profile_by_user(db, user_id)
    if profile:
        db.delete(profile)
        db.commit()
