from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from src.db.session import Base


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False, index=True)
    abstract = Column(Text, nullable=False)
    authors = Column(JSON, default=list) # Array of author names e.g. ["Chen, S.", "Torres, E."]
    journal = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    type = Column(String(50), default="Journal") # Journal, Conference, Book, Patent, Report
    status = Column(String(50), default="Published") # Published, Under Review, Rejected, Draft
    doi = Column(String(255), unique=True, nullable=True, index=True)
    citations = Column(Integer, default=0)
    pages = Column(String(50), nullable=True)
    volume = Column(String(50), nullable=True)
    issue = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
