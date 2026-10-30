# modules/audit_log/backend/service.py

from sqlalchemy.orm import Session
from .models import AuditLogEntry
from .schemas import AuditLogEntryRead
from typing import List, Optional
from datetime import datetime

def list_entries(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    entity: Optional[str] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
) -> List[AuditLogEntry]:
    q = db.query(AuditLogEntry)
    if user_id is not None:
        q = q.filter(AuditLogEntry.user_id == user_id)
    if action:
        q = q.filter(AuditLogEntry.action == action)
    if entity:
        q = q.filter(AuditLogEntry.entity == entity)
    if start:
        q = q.filter(AuditLogEntry.timestamp >= start)
    if end:
        q = q.filter(AuditLogEntry.timestamp <= end)
    return q.offset(skip).limit(limit).all()

def export_csv(db: Session, entries: List[AuditLogEntry]) -> str:
    # Returns CSV string; caller will stream as file.
    import csv, io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "user_id", "action", "entity", "entity_id", "details", "timestamp"])  # header
    for e in entries:
        writer.writerow([
            e.id,
            e.user_id,
            e.action,
            e.entity,
            e.entity_id if e.entity_id is not None else "",
            e.details if e.details is not None else "",
            e.timestamp.isoformat(),
        ])
    return output.getvalue()
