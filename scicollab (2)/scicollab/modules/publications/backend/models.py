# modules/publications/backend/models.py

from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Publication(Base):
    __tablename__ = "pub_publications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(Enum('Journal','Conference','Book','Patent','Technical Report', name='pub_type'), nullable=False)
    status = Column(Enum('Draft','Submitted','Published','Archived', name='pub_status'), nullable=False, default='Draft')
    doi = Column(String, unique=True, nullable=True)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey('users.id'))
    institution_id = Column(Integer, ForeignKey('institutions.id'))

    created_by = relationship('User')
    institution = relationship('Institution')
    history = relationship('PublicationHistory', back_populates='publication', cascade='all, delete-orphan')

class PublicationHistory(Base):
    __tablename__ = "pub_publication_history"
    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, ForeignKey('pub_publications.id'))
    old_status = Column(Enum('Draft','Submitted','Published','Archived', name='pub_status'))
    new_status = Column(Enum('Draft','Submitted','Published','Archived', name='pub_status'))
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by_id = Column(Integer, ForeignKey('users.id'))

    publication = relationship('Publication', back_populates='history')
    changed_by = relationship('User')
