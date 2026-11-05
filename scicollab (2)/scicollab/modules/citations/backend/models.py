# modules/citations/backend/models.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Citation(Base):
    __tablename__ = "cit_citations"
    id = Column(Integer, primary_key=True, index=True)
    pub_id = Column(Integer, ForeignKey('pub_publications.id'), nullable=False)
    citing_doi = Column(String, nullable=False)
    created_by_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    publication = relationship('Publication')
    creator = relationship('User')
