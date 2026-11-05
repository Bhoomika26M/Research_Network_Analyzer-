# core/backend/app/core/audit.py

from datetime import datetime
from sqlalchemy.orm import Session
from .database import Base, engine
from sqlalchemy import Column, Integer, String, DateTime, JSON

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create table if missing (called on startup)
async def init_audit_logger():
    Base.metadata.create_all(bind=engine, tables=[AuditLog.__table__])

def log_event(db: Session, user_id: int, action: str, entity: str, entity_id: int | None = None, details: dict | None = None):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details,
    )
    db.add(entry)
    db.commit()
