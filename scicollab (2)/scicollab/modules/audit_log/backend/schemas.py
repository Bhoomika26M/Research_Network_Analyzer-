# modules/audit_log/backend/schemas.py

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogEntryRead(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        orm_mode = True
