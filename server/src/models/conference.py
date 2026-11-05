from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from src.db.session import Base


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    shortName = Column(String(50), nullable=False)
    location = Column(String(255), nullable=False)
    startDate = Column(String(50), nullable=False)
    endDate = Column(String(50), nullable=False)
    type = Column(String(50), default="International") # International, Workshop, Symposium
    website = Column(String(255), nullable=False)
    presentations = Column(JSON, default=list) # Array of publication IDs
    created_at = Column(DateTime, default=datetime.utcnow)
