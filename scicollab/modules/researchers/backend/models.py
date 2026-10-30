# modules/researchers/backend/models.py

from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ResearcherProfile(Base):
    __tablename__ = "res_researchers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    department = Column(String, nullable=True)
    skills = Column(JSON, nullable=True)          # list of strings
    interests = Column(JSON, nullable=True)      # list of strings
    affiliations = Column(JSON, nullable=True)   # list of institution IDs

    user = relationship('User')
