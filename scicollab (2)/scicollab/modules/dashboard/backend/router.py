# modules/dashboard/backend/router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.core.responses import create_success_response, create_error_response
from .schemas import DashboardSummary
from .service import get_summary

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db), _: "User" = Depends(require_role('Researcher','Institution Admin','Reviewer','System Admin'))):
    try:
        data = get_summary(db)
        return data
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
