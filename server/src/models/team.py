from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from src.db.session import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    project = Column(String(255), default="No project assigned")
    members = Column(JSON, default=list)  # Array of {name, role, initials}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
