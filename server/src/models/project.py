from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from src.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Active") # Active, Completed, Paused
    pi = Column(String(255), nullable=False)
    members = Column(JSON, default=list) # Array of researcher IDs
    startDate = Column(String(50), nullable=False)
    endDate = Column(String(50), nullable=True)
    tags = Column(JSON, default=list) # Array of tag strings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
