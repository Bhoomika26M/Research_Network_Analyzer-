from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from src.db.session import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    pub_id = Column(Integer, nullable=False, index=True)
    pub_title = Column(Text, nullable=False)
    pub_author = Column(String(255), nullable=False)
    pub_institution = Column(String(255), nullable=False)
    pub_abstract = Column(Text, nullable=True)
    pub_keywords = Column(Text, nullable=True)   # comma-separated
    pub_venue = Column(String(255), nullable=True)
    pub_type = Column(String(50), default="Journal")
    submitted_date = Column(String(50), nullable=True)
    deadline = Column(String(50), nullable=True)
    status = Column(String(50), default="Pending")  # Pending, In Progress, Completed, Overdue
    decision = Column(String(50), nullable=True)     # Approved, Rejected, Revisions Required
    overall_score = Column(Integer, nullable=True)
    method_score = Column(Integer, nullable=True)
    novelty_score = Column(Integer, nullable=True)
    clarity_score = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)
    reviewer_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
