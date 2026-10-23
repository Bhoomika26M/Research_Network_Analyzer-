from typing import Optional
from pydantic import BaseModel


class AuditLogBase(BaseModel):
    actor: str
    action: str
    target: str
    timestamp: str
    ip: str = "127.0.0.1"
    category: str = "Data"


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    id: int

    class Config:
        from_attributes = True
