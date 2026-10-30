# modules/dashboard/backend/models.py

from sqlalchemy import Column, Integer, ForeignKey, String, func
from sqlalchemy.orm import relationship
from app.core.database import Base

# Simple aggregates are computed on the fly; no dedicated tables needed for now.
# However we create a placeholder table to anchor the module for Alembic.
class DashboardPlaceholder(Base):
    __tablename__ = "dashboard_placeholder"
    id = Column(Integer, primary_key=True)
    note = Column(String, default="placeholder for dashboard module")
