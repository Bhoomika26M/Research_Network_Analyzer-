from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from src.db.session import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    sourcePubId = Column(Integer, nullable=False, index=True)
    targetPubId = Column(Integer, nullable=False, index=True)
    year = Column(Integer, nullable=False)
    context = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
