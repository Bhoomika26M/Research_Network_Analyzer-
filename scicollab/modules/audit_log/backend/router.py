# modules/audit_log/backend/router.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.core.deps import get_db, require_role
from app.core.audit import log_event
from modules.auth.backend.models import User
from . import service, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.AuditLogEntryRead])
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    entity: Optional[str] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_role('System Admin')),
):
    entries = service.list_entries(
        db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        action=action,
        entity=entity,
        start=start,
        end=end,
    )
    return entries

@router.get("/export", response_class="plain")
def export_audit_csv(
    db: Session = Depends(get_db),
    _: User = Depends(require_role('System Admin')),
):
    entries = service.list_entries(db, limit=10000)  # export up to 10k rows for demo
    csv_content = service.export_csv(db, entries)
    return {
        "success": True,
        "data": csv_content,
        "message": "CSV export",
    }
