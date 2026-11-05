from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from src.db.session import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    projectId = Column(Integer, nullable=False, index=True)
    researcherId = Column(Integer, nullable=False, index=True)
    role = Column(String(100), default="Researcher")
    status = Column(String(50), nullable=True)  # Assigned, In Progress, Complete, null
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
