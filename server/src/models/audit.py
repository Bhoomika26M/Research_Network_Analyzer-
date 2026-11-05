from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from src.db.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    target = Column(String(255), nullable=False)
    timestamp = Column(String(100), default=lambda: datetime.utcnow().isoformat())
    ip = Column(String(50), default="127.0.0.1")
    category = Column(String(50), default="Data") # Auth, Data, Admin, Export
    created_at = Column(DateTime, default=datetime.utcnow)
