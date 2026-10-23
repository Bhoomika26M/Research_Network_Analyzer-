import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from src.db.session import Base


class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    PI = "Principal Investigator"
    RESEARCHER = "Associate Professor"
    ASSISTANT_PROFESSOR = "Assistant Professor"
    POSTDOC = "Postdoctoral Researcher"
    REVIEWER = "Reviewer"
    INSTITUTION_ADMIN = "Institution Admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    initials = Column(String(10), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    role = Column(String(100), default="Associate Professor")
    bio = Column(Text, nullable=True)
    skills = Column(JSON, default=list)       # Array of skills
    interests = Column(JSON, default=list)    # Array of research interests
    publications_ids = Column(JSON, default=list)
    h_index = Column(Integer, default=0)
    citations_total = Column(Integer, default=0)
    is_active = Column(String(20), default="Active") # Active, Suspended, Inactive
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
