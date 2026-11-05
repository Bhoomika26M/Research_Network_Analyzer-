from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from src.db.session import Base


class PublicationLink(Base):
    __tablename__ = "publication_links"

    id = Column(Integer, primary_key=True, index=True)
    sourceTitle = Column(String(255), nullable=False)
    targetTitle = Column(String(255), nullable=False)
    targetAuthors = Column(String(255), nullable=False)
    targetYear = Column(String(20), nullable=False)
    targetType = Column(String(50), default="Journal")
    relation = Column(String(20), default="Cites")  # Cites, Related, Extends, Refutes
    created_at = Column(DateTime, default=datetime.utcnow)
