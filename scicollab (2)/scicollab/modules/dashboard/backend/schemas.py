# modules/dashboard/backend/schemas.py

from pydantic import BaseModel
from typing import Optional

class DashboardSummary(BaseModel):
    users: int
    institutions: int
    publications: int
    citations: int
    collaborations: int
    class Config:
        orm_mode = True
